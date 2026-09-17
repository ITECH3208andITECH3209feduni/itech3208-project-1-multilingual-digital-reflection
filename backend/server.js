//
// require dependencies that are needed for the server to run express, cors, dotenv, supabase-js, multer, cloudinary
//
const express = require('express');
const cors = require('cors');
// Load environment variables from .env file
require('dotenv').config();
// Import the Supabase client library
const { createClient } = require('@supabase/supabase-js');
const authRoutes = require('./auth');
// Import the authentication middleware
const authenticateUser = require('./authMiddleware');

// Import multer and cloudinary for file uploads
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file upload
// multler helper is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'));
    }
  }
});
// Create an Express application
const app = express();

// Handle CORS manually - must be first!
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware 
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Increase timeout for large file uploads
app.use((req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'StoryBond API v2 is running!' });
});

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'storybond-backend' });
});

// ============= AUTH ROUTES =============

app.use('/api/auth', authRoutes);

// ============= CHILDREN ROUTES =============

// Get all children for a specific parent
app.get(
  '/api/children/parent/:parentId', authenticateUser, 
  async (req, res) => {

  try {
    const parentId = req.user.parentId;
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
// Add a new child for a specific parent
app.post('/api/children', authenticateUser, async (req, res) => {
  try {
    const { name, date_of_birth, avatar, color } = req.body;
    const parent_id = req.user.parentId;
    const { data, error } = await supabase
      .from('children')
      .insert([{
        parent_id,
        name,
        date_of_birth,
        avatar: avatar || '🦊',
        color: color || 'blue'
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Child added successfully!', data: data });
  } catch (error) { // Handle errors and send a response with status 400 and the error message
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete child
app.delete('/api/children/:childId', authenticateUser, async (req, res) => {
  try {
    const { childId } = req.params;

    // First delete all entries for this child
    await supabase
      .from('journal_entries')
      .delete()
      .eq('child_id', childId);

    // Then delete the child
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (error) throw error;
    res.json({ success: true, message: 'Child deleted!' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============= JOURNAL ENTRIES ROUTES =============
// Get all journal entries for a specific parent, including associated children and media
app.get('/api/entries-new/parent/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select(`*, children(name, avatar, color)`)
      .eq('parent_id', parentId)
      .order('entry_date', { ascending: false });

    if (error) throw error;

    const entriesWithMedia = await Promise.all(
      entries.map(async (entry) => {
        const { data: media } = await supabase
          .from('media')
          .select('file_url, media_type, thumbnail_url')
          .eq('entry_id', entry.id);
        return { ...entry, media: media || [] };
      })
    );

    res.json({ success: true, data: entriesWithMedia });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
// Add a new journal entry for a specific parent and child
app.post('/api/entries-new', async (req, res) => {
  try {
    const { parent_id, child_id, title, entry_date, content, mood, language, is_milestone } = req.body;
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        parent_id,
        child_id,
        title,
        entry_date,
        content,
        mood: mood || 'happy',
        language: language || 'EN',
        is_milestone: is_milestone || false
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Journal entry created successfully!', data: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get a single entry (with media) for editing
app.get('/api/entries-new/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;

    const { data: entry, error } = await supabase
      .from('journal_entries')
      .select(`*, children(name, avatar, color)`)
      .eq('id', entryId)
      .single();

    if (error) throw error;

    const { data: media } = await supabase
      .from('media')
      .select('file_url, media_type, thumbnail_url')
      .eq('entry_id', entryId);

    res.json({ success: true, data: { ...entry, media: media || [] } });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Entry not found' });
  }
});

// Update an existing entry
app.put('/api/entries-new/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { child_id, title, entry_date, content, mood, language, is_milestone } = req.body;

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        child_id,
        title,
        entry_date,
        content,
        mood: mood || 'happy',
        language: language || 'EN',
        is_milestone: is_milestone || false
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Journal entry updated successfully!', data: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete entry
app.delete('/api/entries-new/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;

    // First delete media for this entry
    await supabase
      .from('media')
      .delete()
      .eq('entry_id', entryId);

    // Then delete the entry
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    res.json({ success: true, message: 'Entry deleted!' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============= MEDIA ROUTES =============

app.get('/api/media/entry/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('entry_id', entryId);

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============= UPLOAD ROUTE =============

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded');

    const { parent_id, entry_id } = req.body;
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'storybond',
          chunk_size: 10000000,
          eager_async: true,
          transformation: resourceType === 'image' ? [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ] : [
            { quality: 'auto:low' },
            { width: 1280 },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const { data, error } = await supabase
      .from('media')
      .insert([{
        entry_id: entry_id || null,
        parent_id: parent_id,
        file_url: result.secure_url,
        media_type: resourceType,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        thumbnail_url: result.eager ? result.eager[0].secure_url : result.secure_url
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `${resourceType === 'video' ? 'Video' : 'Photo'} uploaded successfully!`,
      data: data
    });
  } catch (error) {
    console.error('❌ Upload Error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============= TEST ROUTES =============
// Test route to check if the server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});
// Get all journal entries with associated parents and children
app.get('/api/entries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`*, parents(username, full_name), children(name, avatar, color)`)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
