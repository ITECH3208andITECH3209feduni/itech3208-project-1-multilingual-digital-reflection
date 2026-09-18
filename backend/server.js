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

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
  res.json({ success: true, service: 'storybond-backend', version: 2 });
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

// Delete a child only if they belong to the logged-in parent
app.delete(
  '/api/children/:childId',
  authenticateUser,
  async (req, res) => {

    try {

      const { childId } = req.params;
      const parentId = req.user.parentId;


      // Confirm the child belongs to the logged-in parent
      const {
        data: child,
        error: childLookupError
      } = await supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (childLookupError) {
        throw childLookupError;
      }


      if (!child) {
        return res.status(404).json({
          success: false,
          error: 'Child not found or access denied.'
        });
      }


      // Delete journal entries belonging to this child
      const {
        error: entryDeleteError
      } = await supabase
        .from('journal_entries')
        .delete()
        .eq('child_id', childId)
        .eq('parent_id', parentId);


      if (entryDeleteError) {
        throw entryDeleteError;
      }


      // Delete the child
      const {
        error: childDeleteError
      } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)
        .eq('parent_id', parentId);


      if (childDeleteError) {
        throw childDeleteError;
      }


      res.json({
        success: true,
        message: 'Child deleted successfully.'
      });

    } catch (error) {

      console.error(
        'Child delete error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============= JOURNAL ENTRIES ROUTES =============


// Get all journal entries for the logged-in parent
app.get(
  '/api/entries-new/parent/:parentId',
  authenticateUser,
  async (req, res) => {

    try {

      const parentId = req.user.parentId;

      const {
        data: entries,
        error
      } = await supabase
        .from('journal_entries')
        .select(`*, children(name, avatar, color)`)
        .eq('parent_id', parentId)
        .order('entry_date', { ascending: false });

      if (error) {
        throw error;
      }

      const entriesWithMedia =
        await Promise.all(
          entries.map(async (entry) => {

            const {
              data: media,
              error: mediaError
            } = await supabase
              .from('media')
              .select(
                'file_url, media_type, thumbnail_url'
              )
              .eq('entry_id', entry.id);

            if (mediaError) {
              throw mediaError;
            }

            return {
              ...entry,
              media: media || []
            };
          })
        );

      res.json({
        success: true,
        data: entriesWithMedia
      });

    } catch (error) {

      console.error(
        'Parent journal fetch error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// Get journal entries for one child
app.get(
  '/api/entries-new/child/:childId',
  authenticateUser,
  async (req, res) => {

    try {

      const { childId } = req.params;
      const parentId = req.user.parentId;


      // Confirm child belongs to logged-in parent
      const {
        data: child,
        error: childError
      } = await supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (childError) {
        throw childError;
      }


      if (!child) {

        return res.status(403).json({
          success: false,
          error: 'You do not have access to this child.'
        });
      }


      const {
        data: entries,
        error
      } = await supabase
        .from('journal_entries')
        .select(`*, children(name, avatar, color)`)
        .eq('parent_id', parentId)
        .eq('child_id', childId)
        .order('entry_date', { ascending: false });


      if (error) {
        throw error;
      }


      const entriesWithMedia =
        await Promise.all(
          entries.map(async (entry) => {

            const {
              data: media,
              error: mediaError
            } = await supabase
              .from('media')
              .select(
                'file_url, media_type, thumbnail_url'
              )
              .eq('entry_id', entry.id);


            if (mediaError) {
              throw mediaError;
            }


            return {
              ...entry,
              media: media || []
            };
          })
        );


      res.json({
        success: true,
        data: entriesWithMedia
      });

    } catch (error) {

      console.error(
        'Child journal fetch error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// Add a new journal entry
app.post(
  '/api/entries-new',
  authenticateUser,
  async (req, res) => {

    try {

      const {
        child_id,
        title,
        entry_date,
        content,
        mood,
        language,
        is_milestone
      } = req.body;

      const parent_id = req.user.parentId;


      if (!child_id) {

        return res.status(400).json({
          success: false,
          error: 'A child must be selected.'
        });
      }


      if (!title || !title.trim()) {

        return res.status(400).json({
          success: false,
          error: 'Entry title is required.'
        });
      }


      if (!content || !content.trim()) {

        return res.status(400).json({
          success: false,
          error: 'Journal entry content is required.'
        });
      }


      // Confirm child belongs to logged-in parent
      const {
        data: child,
        error: childError
      } = await supabase
        .from('children')
        .select('id')
        .eq('id', child_id)
        .eq('parent_id', parent_id)
        .maybeSingle();


      if (childError) {
        throw childError;
      }


      if (!child) {

        return res.status(403).json({
          success: false,
          error: 'You do not have access to this child.'
        });
      }


      const {
        data,
        error
      } = await supabase
        .from('journal_entries')
        .insert([
          {
            parent_id,
            child_id,
            title: title.trim(),
            entry_date,
            content: content.trim(),
            mood: mood || 'happy',
            language: language || 'EN',
            is_milestone: is_milestone || false
          }
        ])
        .select()
        .single();


      if (error) {
        throw error;
      }


      res.status(201).json({
        success: true,
        message: 'Journal entry created successfully!',
        data
      });

    } catch (error) {

      console.error(
        'Journal entry create error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// Get a single journal entry for editing
app.get(
  '/api/entries-new/:entryId',
  authenticateUser,
  async (req, res) => {

    try {

      const { entryId } = req.params;
      const parentId = req.user.parentId;


      const {
        data: entry,
        error
      } = await supabase
        .from('journal_entries')
        .select(`*, children(name, avatar, color)`)
        .eq('id', entryId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (error) {
        throw error;
      }


      if (!entry) {

        return res.status(404).json({
          success: false,
          error: 'Entry not found or access denied.'
        });
      }


      const {
        data: media,
        error: mediaError
      } = await supabase
        .from('media')
        .select(
          'file_url, media_type, thumbnail_url'
        )
        .eq('entry_id', entryId);


      if (mediaError) {
        throw mediaError;
      }


      res.json({
        success: true,
        data: {
          ...entry,
          media: media || []
        }
      });

    } catch (error) {

      console.error(
        'Journal entry fetch error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// Update an existing journal entry
app.put(
  '/api/entries-new/:entryId',
  authenticateUser,
  async (req, res) => {

    try {

      const { entryId } = req.params;

      const {
        child_id,
        title,
        entry_date,
        content,
        mood,
        language,
        is_milestone
      } = req.body;

      const parentId = req.user.parentId;


      // Confirm entry belongs to logged-in parent
      const {
        data: existingEntry,
        error: entryLookupError
      } = await supabase
        .from('journal_entries')
        .select('id, parent_id')
        .eq('id', entryId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (entryLookupError) {
        throw entryLookupError;
      }


      if (!existingEntry) {

        return res.status(404).json({
          success: false,
          error: 'Entry not found or access denied.'
        });
      }


      // Confirm selected child belongs to logged-in parent
      const {
        data: child,
        error: childError
      } = await supabase
        .from('children')
        .select('id')
        .eq('id', child_id)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (childError) {
        throw childError;
      }


      if (!child) {

        return res.status(403).json({
          success: false,
          error: 'You do not have access to this child.'
        });
      }


      const {
        data,
        error
      } = await supabase
        .from('journal_entries')
        .update({
          child_id,
          title: title?.trim(),
          entry_date,
          content: content?.trim(),
          mood: mood || 'happy',
          language: language || 'EN',
          is_milestone: is_milestone || false
        })
        .eq('id', entryId)
        .eq('parent_id', parentId)
        .select()
        .single();


      if (error) {
        throw error;
      }


      res.json({
        success: true,
        message: 'Journal entry updated successfully!',
        data
      });

    } catch (error) {

      console.error(
        'Journal entry update error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// Delete journal entry
app.delete(
  '/api/entries-new/:entryId',
  authenticateUser,
  async (req, res) => {

    try {

      const { entryId } = req.params;
      const parentId = req.user.parentId;


      // Confirm entry belongs to logged-in parent
      const {
        data: existingEntry,
        error: entryLookupError
      } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('id', entryId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (entryLookupError) {
        throw entryLookupError;
      }


      if (!existingEntry) {

        return res.status(404).json({
          success: false,
          error: 'Entry not found or access denied.'
        });
      }


      // Delete media first
      const {
        error: mediaDeleteError
      } = await supabase
        .from('media')
        .delete()
        .eq('entry_id', entryId);


      if (mediaDeleteError) {
        throw mediaDeleteError;
      }


      // Delete journal entry
      const {
        error
      } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('parent_id', parentId);


      if (error) {
        throw error;
      }


      res.json({
        success: true,
        message: 'Entry deleted!'
      });

    } catch (error) {

      console.error(
        'Journal entry delete error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============= MEDIA ROUTES =============


// ---------------------------------------------
// Get media for one journal entry
// Parent must own the journal entry
// ---------------------------------------------

app.get(
  '/api/media/entry/:entryId',
  authenticateUser,
  async (req, res) => {

    try {

      const { entryId } =
        req.params;

      const parentId =
        req.user.parentId;


      // Confirm the journal entry belongs
      // to the logged-in parent.
      const {
        data: entry,
        error: entryError
      } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('id', entryId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (entryError) {
        throw entryError;
      }


      if (!entry) {

        return res.status(403).json({
          success: false,
          error:
            'You do not have access to this journal entry.'
        });
      }


      const {
        data,
        error
      } = await supabase
        .from('media')
        .select('*')
        .eq('entry_id', entryId)
        .eq('parent_id', parentId);


      if (error) {
        throw error;
      }


      return res.json({
        success: true,
        data: data || []
      });


    } catch (error) {

      console.error(
        'Media fetch error:',
        error
      );


      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);



// ============= UPLOAD ROUTE =============


// ---------------------------------------------
// Upload media
// Parent must own the journal entry
// ---------------------------------------------

app.post(
  '/api/upload',
  authenticateUser,
  upload.single('file'),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          success: false,
          error: 'No file uploaded.'
        });
      }


      const parentId =
        req.user.parentId;


      const {
        entry_id
      } = req.body;


      if (!entry_id) {

        return res.status(400).json({
          success: false,
          error:
            'A journal entry is required for media upload.'
        });
      }


      // Confirm the journal entry belongs
      // to the logged-in parent.
      const {
        data: entry,
        error: entryError
      } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('id', entry_id)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (entryError) {
        throw entryError;
      }


      if (!entry) {

        return res.status(403).json({
          success: false,
          error:
            'You do not have permission to upload media to this journal entry.'
        });
      }


      const resourceType =
        req.file.mimetype.startsWith(
          'video/'
        )
          ? 'video'
          : 'image';


      const result =
        await new Promise(
          (resolve, reject) => {

            const uploadStream =
              cloudinary.uploader.upload_stream(
                {
                  resource_type:
                    resourceType,

                  folder:
                    'storybond',

                  chunk_size:
                    10000000,

                  eager_async:
                    true,

                  transformation:
                    resourceType ===
                    'image'
                      ? [
                          {
                            width: 1200,
                            height: 1200,
                            crop: 'limit'
                          },
                          {
                            quality: 'auto'
                          }
                        ]
                      : [
                          {
                            quality:
                              'auto:low'
                          },
                          {
                            width:
                              1280
                          },
                          {
                            fetch_format:
                              'auto'
                          }
                        ]
                },

                (error, uploadResult) => {

                  if (error) {
                    reject(error);
                  } else {
                    resolve(
                      uploadResult
                    );
                  }
                }
              );


            uploadStream.end(
              req.file.buffer
            );
          }
        );


      const {
        data,
        error
      } = await supabase
        .from('media')
        .insert([
          {
            entry_id:
              entry_id,

            parent_id:
              parentId,

            file_url:
              result.secure_url,

            media_type:
              resourceType,

            file_size:
              req.file.size,

            mime_type:
              req.file.mimetype,

            thumbnail_url:
              result.eager
                ? result.eager[0]
                    .secure_url
                : result.secure_url
          }
        ])
        .select()
        .single();


      if (error) {
        throw error;
      }


      return res.json({
        success: true,

        message:
          `${
            resourceType ===
            'video'
              ? 'Video'
              : 'Photo'
          } uploaded successfully!`,

        data
      });


    } catch (error) {

      console.error(
        'Upload error:',
        error
      );


      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);
// =============================================
// WEEKLY PROGRESS ROUTES
// =============================================

// Save or update one child's weekly progress
app.post(
  '/api/weekly-progress',
  authenticateUser,
  async (req, res) => {

    try {

      const {
        child_id,
        week_start,
        overall_mood,
        communication,
        reading_interest,
        social_interaction,
        parent_concern,
        parent_proud
      } = req.body;

      // Get the parent from the authenticated login
      const parent_id = req.user.parentId;


      // Validate required fields
      if (
        !child_id ||
        !week_start ||
        !overall_mood ||
        !communication ||
        !reading_interest ||
        !social_interaction
      ) {
        return res.status(400).json({
          success: false,
          error: 'Missing required weekly progress fields.'
        });
      }


      // Confirm the child belongs to the logged-in parent
      const {
        data: child,
        error: childError
      } = await supabase
        .from('children')
        .select('id')
        .eq('id', child_id)
        .eq('parent_id', parent_id)
        .maybeSingle();


      if (childError) {
        throw childError;
      }


      if (!child) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this child.'
        });
      }


      // Save or update weekly progress
      const {
        data,
        error
      } = await supabaseAdmin
        .from('weekly_progress')
        .upsert(
          {
            parent_id,
            child_id,
            week_start,
            overall_mood,
            communication,
            reading_interest,
            social_interaction,
            parent_concern:
              parent_concern || null,
            parent_proud:
              parent_proud || null,
            updated_at:
              new Date().toISOString()
          },
          {
            onConflict:
              'child_id,week_start'
          }
        )
        .select()
        .single();


      if (error) {
        throw error;
      }


      res.json({
        success: true,
        message:
          'Weekly progress saved successfully.',
        data
      });

    } catch (error) {

      console.error(
        'Weekly progress save error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// Get all weekly progress records for one child
app.get(
  '/api/weekly-progress/child/:childId',
  authenticateUser,
  async (req, res) => {

    try {

      const { childId } = req.params;
      const parentId = req.user.parentId;


      // Confirm child belongs to logged-in parent
      const {
        data: child,
        error: childError
      } = await supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (childError) {
        throw childError;
      }


      if (!child) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this child.'
        });
      }


      const {
        data,
        error
      } = await supabase
        .from('weekly_progress')
        .select('*')
        .eq('child_id', childId)
        .eq('parent_id', parentId)
        .order('week_start', { ascending: false });


      if (error) {
        throw error;
      }


      res.json({
        success: true,
        data: data || []
      });

    } catch (error) {

      console.error(
        'Weekly progress fetch error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// Get one child's progress for one specific week
app.get(
  '/api/weekly-progress/child/:childId/week/:weekStart',
  authenticateUser,
  async (req, res) => {

    try {

      const {
        childId,
        weekStart
      } = req.params;

      const parentId = req.user.parentId;


      // Confirm child belongs to logged-in parent
      const {
        data: child,
        error: childError
      } = await supabaseAdmin
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (childError) {
        throw childError;
      }


      if (!child) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this child.'
        });
      }


      const {
        data,
        error
      } = await supabaseAdmin
        .from('weekly_progress')
        .select('*')
        .eq('child_id', childId)
        .eq('parent_id', parentId)
        .eq('week_start', weekStart)
        .maybeSingle();


      if (error) {
        throw error;
      }


      res.json({
        success: true,
        data: data || null
      });

    } catch (error) {

      console.error(
        'Weekly progress week fetch error:',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// =============================================
// CLINICIAN ACCESS ROUTES
// =============================================


// ---------------------------------------------
// Grant or update clinician access
// Parent only
// ---------------------------------------------

app.post(
  '/api/clinician-access',
  authenticateUser,
  async (req, res) => {

    try {

      const {
        child_id,
        clinician_email,
        can_view_journal,
        can_view_weekly_progress
      } = req.body;


      const parentId =
        req.user.parentId;


      // Validate required fields
      if (
        !child_id ||
        !clinician_email
      ) {

        return res.status(400).json({
          success: false,
          error:
            'Child and clinician email are required.'
        });
      }


      // Confirm the selected child belongs
      // to the logged-in parent.
      const {
        data: child,
        error: childError
      } = await supabaseAdmin
        .from('children')
        .select('id, name')
        .eq('id', child_id)
        .eq('parent_id', parentId)
        .maybeSingle();


      if (childError) {
        throw childError;
      }


      if (!child) {

        return res.status(403).json({
          success: false,
          error:
            'You cannot grant access to this child.'
        });
      }


      const email =
        clinician_email
          .trim()
          .toLowerCase();


      // Create or update the access grant.
      const {
        data,
        error
      } = await supabaseAdmin
        .from('clinician_access')
        .upsert(
          {
            parent_id: parentId,

            child_id,

            clinician_email: email,

            can_view_journal:
              can_view_journal !== false,

            can_view_weekly_progress:
              can_view_weekly_progress !== false,

            active: true,

            updated_at:
              new Date().toISOString()
          },
          {
            onConflict:
              'child_id,clinician_email'
          }
        )
        .select()
        .single();


      if (error) {
        throw error;
      }


      res.json({
        success: true,
        message:
          'Clinician access granted successfully.',
        data
      });

    } catch (error) {

      console.error(
        'Clinician access grant error:',
        error
      );


      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// ---------------------------------------------
// Get access grants created by this parent
// ---------------------------------------------

app.get(
  '/api/clinician-access',
  authenticateUser,
  async (req, res) => {

    try {

      const parentId =
        req.user.parentId;


      const {
        data,
        error
      } = await supabaseAdmin
        .from('clinician_access')
        .select(`
          *,
          children (
            id,
            name,
            avatar
          )
        `)
        .eq(
          'parent_id',
          parentId
        )
        .order(
          'created_at',
          {
            ascending: false
          }
        );


      if (error) {
        throw error;
      }


      res.json({
        success: true,
        data: data || []
      });

    } catch (error) {

      console.error(
        'Clinician access fetch error:',
        error
      );


      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// ---------------------------------------------
// Revoke clinician access
// Parent only
// ---------------------------------------------

app.delete(
  '/api/clinician-access/:accessId',
  authenticateUser,
  async (req, res) => {

    try {

      const {
        accessId
      } = req.params;


      const parentId =
        req.user.parentId;


      // Only allow the parent who created
      // the access grant to revoke it.
      const {
        data,
        error
      } = await supabaseAdmin
        .from('clinician_access')
        .update({
          active: false,

          updated_at:
            new Date().toISOString()
        })
        .eq(
          'id',
          accessId
        )
        .eq(
          'parent_id',
          parentId
        )
        .select()
        .maybeSingle();


      if (error) {
        throw error;
      }


      if (!data) {

        return res.status(404).json({
          success: false,
          error:
            'Access record not found.'
        });
      }


      res.json({
        success: true,
        message:
          'Clinician access revoked.'
      });

    } catch (error) {

      console.error(
        'Clinician access revoke error:',
        error
      );


      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// =============================================
// CLINICIAN READ-ONLY ROUTES
// =============================================


// Helper: get authenticated clinician from bearer token
async function getAuthenticatedClinician(req) {

  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    return null;
  }

  const accessToken =
    authorization.slice(7);

  const {
    data: authData,
    error: authError
  } = await supabaseAdmin.auth.getUser(
    accessToken
  );

  if (
    authError ||
    !authData.user
  ) {
    return null;
  }

  const {
    data: clinician,
    error: clinicianError
  } = await supabaseAdmin
    .from('clinicians')
    .select(`
      id,
      auth_user_id,
      email,
      full_name,
      profession,
      organisation
    `)
    .eq(
      'auth_user_id',
      authData.user.id
    )
    .maybeSingle();

  if (
    clinicianError ||
    !clinician
  ) {
    return null;
  }

  return clinician;
}


// ---------------------------------------------
// Get children shared with clinician
// ---------------------------------------------

app.get(
  '/api/clinician/children',
  async (req, res) => {

    try {

      const clinician =
        await getAuthenticatedClinician(req);

      if (!clinician) {

        return res.status(401).json({
          success: false,
          error: 'Clinician authentication required.'
        });
      }


      const {
        data,
        error
      } = await supabaseAdmin
        .from('clinician_access')
        .select(`
          id,
          child_id,
          can_view_journal,
          can_view_weekly_progress,
          active,
          children (
            id,
            name,
            avatar,
            date_of_birth,
            color
          )
        `)
        .eq(
          'clinician_email',
          clinician.email
        )
        .eq(
          'active',
          true
        );


      if (error) {
        throw error;
      }


      return res.json({
        success: true,
        data: data || []
      });

    } catch (error) {

      console.error(
        'Clinician children fetch error:',
        error
      );

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// ---------------------------------------------
// Get journal entries for one shared child
// ---------------------------------------------

app.get(
  '/api/clinician/child/:childId/entries',
  async (req, res) => {

    try {

      const clinician =
        await getAuthenticatedClinician(req);

      if (!clinician) {

        return res.status(401).json({
          success: false,
          error: 'Clinician authentication required.'
        });
      }


      const {
        childId
      } = req.params;


      const {
        data: access,
        error: accessError
      } = await supabaseAdmin
        .from('clinician_access')
        .select('*')
        .eq(
          'child_id',
          childId
        )
        .eq(
          'clinician_email',
          clinician.email
        )
        .eq(
          'active',
          true
        )
        .eq(
          'can_view_journal',
          true
        )
        .maybeSingle();


      if (accessError) {
        throw accessError;
      }


      if (!access) {

        return res.status(403).json({
          success: false,
          error:
            'You do not have journal access for this child.'
        });
      }


      const {
        data: entries,
        error
      } = await supabaseAdmin
        .from('journal_entries')
        .select(`
          id,
          child_id,
          title,
          entry_date,
          content,
          mood,
          language,
          is_milestone,
          created_at
        `)
        .eq(
          'child_id',
          childId
        )
        .order(
          'entry_date',
          {
            ascending: false
          }
        );


      if (error) {
        throw error;
      }


      return res.json({
        success: true,
        data: entries || []
      });

    } catch (error) {

      console.error(
        'Clinician journal fetch error:',
        error
      );

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);


// ---------------------------------------------
// Get weekly progress for one shared child
// ---------------------------------------------

app.get(
  '/api/clinician/child/:childId/weekly-progress',
  async (req, res) => {

    try {

      const clinician =
        await getAuthenticatedClinician(req);

      if (!clinician) {

        return res.status(401).json({
          success: false,
          error: 'Clinician authentication required.'
        });
      }


      const {
        childId
      } = req.params;


      const {
        data: access,
        error: accessError
      } = await supabaseAdmin
        .from('clinician_access')
        .select('*')
        .eq(
          'child_id',
          childId
        )
        .eq(
          'clinician_email',
          clinician.email
        )
        .eq(
          'active',
          true
        )
        .eq(
          'can_view_weekly_progress',
          true
        )
        .maybeSingle();


      if (accessError) {
        throw accessError;
      }


      if (!access) {

        return res.status(403).json({
          success: false,
          error:
            'You do not have weekly progress access for this child.'
        });
      }


      const {
        data: progress,
        error
      } = await supabaseAdmin
        .from('weekly_progress')
        .select('*')
        .eq(
          'child_id',
          childId
        )
        .order(
          'week_start',
          {
            ascending: false
          }
        );


      if (error) {
        throw error;
      }


      return res.json({
        success: true,
        data: progress || []
      });

    } catch (error) {

      console.error(
        'Clinician weekly progress fetch error:',
        error
      );


      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

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

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
