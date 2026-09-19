// Shared frontend configuration for every StoryBond page.
// Load this before any other page script so they all talk to the same backend.

const IS_LOCAL_DEV =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// Express backend (backend/server.js). Deployed separately from the static frontend.
const API_URL = IS_LOCAL_DEV
  ? 'http://localhost:3000'
  : 'https://storybond-backend.vercel.app';

// Supabase project used for parent login and password reset.
// Only the public anon key belongs here - never the service-role key.
const SUPABASE_URL = 'https://axhirebelwkzsncellxh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wvas5PH4QFod9WraSdtNmQ_3zXTqmqP';
