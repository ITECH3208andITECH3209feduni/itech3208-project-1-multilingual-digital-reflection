const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit - supports 5 min videos
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'));
    }
  }
});
const app = express();

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
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'StoryBond API is running!' });
});

// ============= AUTH ROUTES =============

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data: user, error } = await supabase
      .from('parents')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !user) {
      throw new Error('Invalid username or password');
    }

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          preferred_language: user.preferred_language
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password, full_name } = req.body;

    const { data, error } = await supabase
      .from('parents')
      .insert([{
        username,
        email,
        password,
        full_name,
        preferred_language: 'EN'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Account created successfully!',
      data: { user: data }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============= CHILDREN ROUTES =============

// Get children by parent
app.get('/api/children/parent/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Add child
app.post('/api/children', async (req, res) => {
  try {
    const { parent_id, name, date_of_birth, avatar, color } = req.body;

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

    res.json({
      success: true,
      message: 'Child added successfully!',
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============= JOURNAL ENTRIES ROUTES =============

// Get entries by parent
app.get('/api/entries-new/parent/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;

    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        children(name, avatar, color)
      `)
      .eq('parent_id', parentId)
      .order('entry_date', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Create journal entry
app.post('/api/entries-new', async (req, res) => {
  try {
    const {
      parent_id,
      child_id,
      title,
      entry_date,
      content,
      mood,
      language,
      is_milestone
    } = req.body;

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

    res.json({
      success: true,
      message: 'Journal entry created successfully!',
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============= UPLOAD ROUTE =============

// Upload photo or video
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const { parent_id, entry_id } = req.body;

    // Determine resource type (image or video)
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

  // Upload to Cloudinary
const result = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      resource_type: resourceType,
      folder: 'storybond',
      chunk_size: 10000000, // 10MB chunks for faster upload
eager_async: true,     // Process in background
    transformation: resourceType === 'image' ? [
  { width: 1200, height: 1200, crop: 'limit' },
  { quality: 'auto' }
] : [
  { quality: 'auto:low' },  // Lower quality = faster upload
  { width: 1280 },           // Limit resolution for speed
  { fetch_format: 'auto' }   // Auto-optimize format
]
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );
  uploadStream.end(req.file.buffer);
});
      

    // Save to database
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

  }  catch (error) {
  console.error('❌ Upload Error:', error.message);
  console.error('Full error:', error);
  res.status(400).json({
    success: false,
    error: error.message
  });

  }
});

// ============= TEST ROUTES =============

// Get all parents
app.get('/api/parents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parents')
      .select('*');

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get all entries
app.get('/api/entries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        parents(username, full_name),
        children(name, avatar, color)
      `)
      .order('entry_date', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:3000`);
});
