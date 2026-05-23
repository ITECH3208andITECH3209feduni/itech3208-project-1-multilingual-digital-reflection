const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get all children for a specific parent
router.get('/parent/:parentId', async (req, res) => {
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

// Add a new child
router.post('/', async (req, res) => {
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

// Get single child details
router.get('/:childId', async (req, res) => {
  try {
    const { childId } = req.params;

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }
});

module.exports = router;