const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get all entries for a specific parent
router.get('/parent/:parentId', async (req, res) => {
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

// Get entries for a specific child
router.get('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('child_id', childId)
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

// Create new journal entry
router.post('/', async (req, res) => {
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

// Get single entry
router.get('/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;

    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        children(name, avatar, color),
        parents(username, full_name)
      `)
      .eq('id', entryId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Entry not found'
    });
  }
});

module.exports = router;