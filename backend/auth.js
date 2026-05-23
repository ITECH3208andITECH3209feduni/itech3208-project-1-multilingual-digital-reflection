const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, username, password, full_name } = req.body;

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name
        }
      }
    });

    if (authError) throw authError;

    // Also insert into parents table
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .insert([
        {
          id: authData.user.id,
          username,
          email,
          password: password, // In production, this should be hashed!
          full_name,
          preferred_language: 'EN'
        }
      ])
      .select()
      .single();

    if (parentError) throw parentError;

    res.json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: parentData,
        session: authData.session
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('parents')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (userError || !user) {
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

// Get current user info
router.get('/me/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('parents')
      .select('id, username, email, full_name, preferred_language')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

module.exports = router;