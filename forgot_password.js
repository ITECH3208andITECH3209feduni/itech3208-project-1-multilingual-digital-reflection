// connect to the backend API
const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin;

  const SUPABASE_URL = 'https://axhirebelwkzsncellxh.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_wvas5PH4QFod9WraSdtNmQ_3zXTqmqP';

// retrieve the form and input elements from the DOM

const form = document.getElementById('forgotPasswordForm');
const emailInput = document.getElementById('email');
const message = document.getElementById('message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();

  message.textContent = 'Sending reset link...';
  // get the email value from the input field
  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/recover`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY
        },

        body: JSON.stringify({
          email,
          redirect_to: `${window.location.origin}/reset_password.html`
        })
      }
    );

    const data = await response.json();
    // check if the response is not ok and display an error message
    if (!response.ok) {
      message.className = 'auth-message error';
      message.textContent =
          data.error || 'Unable to send reset link.';
      return;
    }
    // display a success message if the reset link was sent successfully
    message.className = 'auth-message success';
    message.textContent = data.message;

  } catch (error) {
    console.error(
        'Forgot password error:',
        error
    );
    // display an error message if there was an issue connecting to the server
    message.className = 'auth-message error';

    message.textContent =
        'Unable to connect to the server.';
  }
});