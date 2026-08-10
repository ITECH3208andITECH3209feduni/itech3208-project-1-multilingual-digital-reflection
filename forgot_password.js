// connect to the backend API
const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://storybond-backend.vercel.app';

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
      `${API_URL}/api/auth/forgot-password`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          email: email
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