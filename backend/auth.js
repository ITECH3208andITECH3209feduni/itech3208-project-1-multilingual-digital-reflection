// instead of putting every route in server.js, 
//this file will control: POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// create a smaller route for authentication
const router = express.Router();

//normal user actions suc as signup, login, and verifying access token will use the anon key, while admin actions such as creating a profile will use the service role key

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
// trusted backend work such as username existence,
// parents profile creation, and deleting auth users when sign up fails.

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

//Route for signing up a new user. 
// This route will create a new user in Supabase Auth and then create a corresponding parent profile in the 'parents' table. If any step fails, it will clean up by deleting the created Auth user.
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  let createdAuthUserId = null;

  try {
    const { email, username, password, full_name } = req.body;
    // cleanup the input data by trimming whitespace and normalizing case for email and username
    const normalisedEmail = String(email || '')
      .trim()
      .toLowerCase();
    // clean up username
    const normalisedUsername = String(username || '').trim();
    // cleanup full name
    const normalisedFullName = String(
      full_name || username || ''
    ).trim();
    // check if all required fields are provided, 
    // rejects blank or missing fields
    if (
      !normalisedEmail ||
      !normalisedUsername ||
      !password ||
      !normalisedFullName
    ) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required.'
      });
    }
    // check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if email is not valid, return error
    if (!emailRegex.test(normalisedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }
    // check if password is at least 8 characters long
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least 8 characters.'
      });
    }
    // check if username is at least 3 characters long
    if (normalisedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must contain at least 3 characters.'
      });
    }

    // check if username is already taken or email is already registered
    // check for duplicate accounts by querying the 'parents' table for existing records with the same username or email
    const { data: existingParent, error: lookupError } =
      await supabaseAdmin
        .from('parents')
        .select('id')
        .or(
          `username.eq.${normalisedUsername},email.eq.${normalisedEmail}`
        )
        .maybeSingle();

    if (lookupError) {
      console.error('Account lookup error:', lookupError);

      return res.status(500).json({
        success: false,
        error: 'Unable to check account availability.'
      });
    }

    if (existingParent) {
      return res.status(409).json({
        success: false,
        error: 'That username or email is already registered.'
      });
    }

    // create the secure superbase Auth user account 
    // with the provided email and password, 
    // this new code sends the password to supabase Auth.superbase and store additional user data (username and full name) in the Auth metadata
    const { data: authData, error: authError } =
      await supabaseAuth.auth.signUp({
        email: normalisedEmail,
        password,
        options: {
          data: {
            username: normalisedUsername,
            full_name: normalisedFullName
          }
        }
      });

    if (authError) {
      console.error('Supabase signup error:', authError);

      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        error: 'Authentication account was not created.'
      });
    }

    createdAuthUserId = authData.user.id;
    // create the parent profile in the 'parents' table,
    //  linking it to the newly created Auth user
    const { data: parent, error: parentError } =
      await supabaseAdmin
        .from('parents')
        .insert([
          {
            auth_user_id: authData.user.id,
            username: normalisedUsername,
            email: normalisedEmail,
            full_name: normalisedFullName,
            preferred_language: 'EN'
          }
        ])
        .select(//returns safe fields only, excluding sensitive information like passwords or tokens
          'id, auth_user_id, username, email, full_name, preferred_language'
        )
        .single();

    if (parentError) {
      console.error('Parent profile error:', parentError);

      await supabaseAdmin.auth.admin.deleteUser(
        authData.user.id
      );

      return res.status(500).json({
        success: false,
        error: parentError.message,
        details: parentError.details,
        hint: parentError.hint,
        code: parentError.code
      });
    }

    return res.status(201).json({
      success: true,
      message: authData.session
        ? 'Account created successfully.'
        : 'Account created. Check your email to confirm it.',
      data: {
        user: parent,
        session: authData.session
      }
    });
  } catch (error) {
    console.error('Unexpected signup error:', error);

    if (createdAuthUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(
          createdAuthUserId
        );
      } catch (cleanupError) {
        console.error(
          'Could not clean up Auth user:',
          cleanupError
        );
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Unable to create the account.'
    });
  }
});
//Login Route: This route will authenticate a user using their email or username and password. It will return the user's profile and session information if successful.
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const loginIdentifier =
      req.body.loginIdentifier || req.body.username;

    const password = req.body.password;

    const identifier = String(loginIdentifier || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username or email and password are required.'
      });
    }

    // Look up the account by email or username first, so we can tell the
    // user "this account doesn't exist" separately from "wrong password".
    const isEmail = identifier.includes('@');
    const lookupColumn = isEmail ? 'email' : 'username';
    const lookupValue = isEmail ? identifier.toLowerCase() : identifier;

    const { data: parentLookup, error: lookupError } =
      await supabaseAdmin
        .from('parents')
        .select('email')
        .eq(lookupColumn, lookupValue)
        .maybeSingle();

    if (lookupError) {
      console.error('Login lookup error:', lookupError);

      return res.status(500).json({
        success: false,
        error: 'Login is temporarily unavailable.'
      });
    }

    if (!parentLookup) {
      return res.status(404).json({
        success: false,
        error: "This user doesn't exist.",
        code: 'USER_NOT_FOUND'
      });
    }

    const email = parentLookup.email;
    //secure login call to supabase Auth using the email and password provided by the user. If successful, it retrieves the user's profile from the 'parents' table.
    const { data: authData, error: authError } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password
      });

    if (authError || !authData.user || !authData.session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password.'
      });
    }

    const { data: parent, error: parentError } =
      await supabaseAdmin
        .from('parents')
        .select(
          'id, auth_user_id, username, email, full_name, preferred_language'
        )
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

    if (parentError) {
      console.error('Profile lookup error:', parentError);

      return res.status(500).json({
        success: false,
        error: 'The account profile could not be loaded.'
      });
    }

    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'No StoryBond profile is linked to this account.'
      });
    }
    // return a login session
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: parent,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at
        }
      }
    });
  } catch (error) {
    console.error('Unexpected login error:', error);

    return res.status(500).json({
      success: false,
      error: 'Login is temporarily unavailable.'
    });
  }
});
// Route to get the current authenticated user's profile.
// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const accessToken = authorization.slice(7);

    const { data: authData, error: authError } =
      await supabaseAuth.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        error: 'Your session is invalid or has expired.'
      });
    }

    const { data: parent, error: parentError } =
      await supabaseAdmin
        .from('parents')
        .select(
          'id, auth_user_id, username, email, full_name, preferred_language'
        )
        .eq('auth_user_id', authData.user.id)
        .single();

    if (parentError) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found.'
      });
    }

    return res.json({
      success: true,
      data: {
        user: parent
      }
    });
  } catch (error) {
    console.error('Current-user error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to load the current user.'
    });
  }
});

// POST /api/auth/forgot-password
// This route will initiate the password reset process for a user by sending a password reset email. It uses Supabase Auth's resetPasswordForEmail method to send the email with a redirect link to the password reset page.
router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required.'
      });
    }

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}/reset_password.html`
      }
    );

    if (error) {
      console.error('Password reset error:', error);

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to process password reset.'
    });
  }
});

// =============================================
// CLINICIAN AUTHENTICATION
// =============================================


// ---------------------------------------------
// Clinician signup
// POST /api/auth/clinician/signup
// ---------------------------------------------

router.post(
  '/clinician/signup',
  async (req, res) => {

    let createdAuthUserId = null;

    try {

      const {
        email,
        password,
        full_name,
        profession,
        organisation
      } = req.body;


      if (
        !email ||
        !password ||
        !full_name
      ) {

        return res.status(400).json({
          success: false,
          error:
            'Email, password and full name are required.'
        });
      }


      const normalisedEmail =
        email.trim().toLowerCase();


      // Check clinician profile does not already exist
      const {
        data: existingClinician,
        error: lookupError
      } = await supabaseAdmin
        .from('clinicians')
        .select('id')
        .eq('email', normalisedEmail)
        .maybeSingle();


      if (lookupError) {
        throw lookupError;
      }


      if (existingClinician) {

        return res.status(409).json({
          success: false,
          error:
            'A clinician account already exists with this email.'
        });
      }


      // Create Supabase Auth account
      const {
        data: authData,
        error: authError
      } = await supabaseAuth.auth.signUp({
        email: normalisedEmail,
        password,
        options: {
          data: {
            full_name:
              full_name.trim(),

            role:
              'clinician'
          }
        }
      });


      if (authError) {
        throw authError;
      }


      if (!authData.user) {

        return res.status(500).json({
          success: false,
          error:
            'Clinician authentication account was not created.'
        });
      }


      createdAuthUserId =
        authData.user.id;


      // Create clinician profile
      const {
        data: clinician,
        error: clinicianError
      } = await supabaseAdmin
        .from('clinicians')
        .insert([
          {
            auth_user_id:
              authData.user.id,

            email:
              normalisedEmail,

            full_name:
              full_name.trim(),

            profession:
              profession?.trim() ||
              'psychologist',

            organisation:
              organisation?.trim() ||
              null
          }
        ])
        .select()
        .single();


      if (clinicianError) {

        await supabaseAdmin
          .auth
          .admin
          .deleteUser(
            authData.user.id
          );

        throw clinicianError;
      }


      return res.status(201).json({
        success: true,
        message:
          'Clinician account created successfully.',
        data: {
          user: clinician,
          session:
            authData.session
        }
      });

    } catch (error) {

      console.error(
        'Clinician signup error:',
        error
      );


      if (createdAuthUserId) {

        try {

          await supabaseAdmin
            .auth
            .admin
            .deleteUser(
              createdAuthUserId
            );

        } catch (cleanupError) {

          console.error(
            'Clinician cleanup error:',
            cleanupError
          );
        }
      }


      return res.status(500).json({
        success: false,
        error:
          error.message ||
          'Unable to create clinician account.'
      });
    }
  }
);


// ---------------------------------------------
// Clinician login
// POST /api/auth/clinician/login
// ---------------------------------------------

router.post(
  '/clinician/login',
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      if (!email || !password) {

        return res.status(400).json({
          success: false,
          error:
            'Email and password are required.'
        });
      }


      const normalisedEmail =
        email.trim().toLowerCase();


      // Authenticate with Supabase Auth
      const {
        data: authData,
        error: authError
      } =
        await supabaseAuth
          .auth
          .signInWithPassword({
            email:
              normalisedEmail,
            password
          });


      if (
        authError ||
        !authData.user ||
        !authData.session
      ) {

        return res.status(401).json({
          success: false,
          error:
            'Invalid email or password.'
        });
      }


      // Load clinician profile
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


      if (clinicianError) {
        throw clinicianError;
      }


      if (!clinician) {

        return res.status(403).json({
          success: false,
          error:
            'This account is not registered as a clinician.'
        });
      }


      return res.json({
        success: true,
        message:
          'Clinician login successful.',
        data: {

          user: {
            ...clinician,
            role: 'clinician'
          },

          session: {
            access_token:
              authData.session.access_token,

            refresh_token:
              authData.session.refresh_token,

            expires_at:
              authData.session.expires_at
          }
        }
      });

    } catch (error) {

      console.error(
        'Clinician login error:',
        error
      );


      return res.status(500).json({
        success: false,
        error:
          'Clinician login is temporarily unavailable.'
      });
    }
  }
);

module.exports = router;
