const { createClient } = require('@supabase/supabase-js');

// Used to validate the user's access token
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Used only on the trusted backend to locate the StoryBond parent profile
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

async function authenticateUser(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    // The frontend must send:
    // Authorization: Bearer <accessToken>
    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const accessToken = authorization.slice(7);

    // Ask Supabase to validate the token
    const { data: authData, error: authError } =
      await supabaseAuth.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        error: 'Your session is invalid or has expired.'
      });
    }

    // Find the StoryBond parent belonging to this Supabase user
    const { data: parent, error: parentError } =
      await supabaseAdmin
        .from('parents')
        .select(
          'id, auth_user_id, username, email, full_name, preferred_language'
        )
        .eq('auth_user_id', authData.user.id)
        .single();

    if (parentError || !parent) {
      return res.status(403).json({
        success: false,
        error: 'StoryBond profile not found.'
      });
    }

    // Attach the verified user to the request
    req.user = {
      authUserId: authData.user.id,
      parentId: parent.id,
      parent
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to verify authentication.'
    });
  }
}

module.exports = authenticateUser;
