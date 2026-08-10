// 
// StoryBond Signup Script
// Handles:
// 1. Form validation
// 2. Sending signup details to the backend
// 3. Displaying useful errors
// 4. Showing a loading state
// 5. Redirecting the user to the login page
// 


// Local backend API address.
const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://storybond-backend.vercel.app';

// General signup settings.
const CONFIG = {
  // Must match the password requirement in backend/auth.js.
  MIN_PASSWORD: 8,

  // Currently available if a delay is needed elsewhere.
  DELAY_MS: 1400,
};

// DOM helper functions
// These functions reduce repeated code when working with HTML elements and validation messages.

const DOM = {
  // Finds an HTML element using its ID.
  get: (id) => document.getElementById(id),

  // Adds a CSS class to an element.
  show: (element, className) => {
    element?.classList.add(className);
  },

  // Removes a CSS class from an element.
  hide: (element, className) => {
    element?.classList.remove(className);
  },

  // Displays an error below an input field.
  showError: (input, message, errorElement) => {
    // Add an error style to the input.
    input?.classList.add('is-error');

    // Display the error message.
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('is-visible');
    }
  },

  // Removes an error message from an input field.
  clearError: (input, errorElement) => {
    // Remove the error style from the input.
    input?.classList.remove('is-error');

    // Hide and clear the error message.
    if (errorElement) {
      errorElement.classList.remove('is-visible');
      errorElement.textContent = '';
    }
  },

  // Enables or disables the signup button.
  // This prevents users from sending multiple requests
  // while signup is being processed.
  setLoading: (button, loading) => {
    if (!button) return;

    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
  },
};


// 
// Form validator
// Checks the form before sending information to the server.
// The backend also validates the information because
// frontend validation can be bypassed.
// 

const Validator = {
  // Checks that the email has a basic valid format.
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Runs all signup validation checks.
  run: (
    email,
    username,
    password,
    confirmPassword,
    termsChecked
  ) => {
    const errors = {};

    // 
    // Email validation
    // 

    if (!email) {
      errors.email =
        '⚠️ Please enter your email address!';
    } else if (!Validator.validateEmail(email)) {
      errors.email =
        '⚠️ Please enter a valid email address!';
    }

    // 
    // Username validation
    // 

    if (!username || username.length < 3) {
      errors.username =
        '⚠️ Username must be at least 3 characters!';
    }

    // 
    // Password validation
    // 

    if (password.length < CONFIG.MIN_PASSWORD) {
      errors.password =
        `⚠️ Password needs at least ${CONFIG.MIN_PASSWORD} characters!`;
    }

    // 
    // Confirm-password validation
    //

    if (password !== confirmPassword) {
      errors.confirmPassword =
        '⚠️ Passwords do not match!';
    }

    // 
    // Terms and conditions validation
    // 

    if (!termsChecked) {
      errors.terms =
        '⚠️ You must agree to the Terms & Conditions!';
    }

    return errors;
  },
};


// 
// Authentication API functions
// Handles communication between the signup page
// and the Node/Express backend.
// 

const Auth = {
  // Sends the new account details to the backend.
  signup: async (email, username, password) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email,
            username,
            password,

            // The current signup form does not have a separate full-name field, so the username is temporarily used as the full name.
            full_name: username,
          }),
        }
      );

      // Convert the server response from JSON
      // into a JavaScript object.
      const data = await response.json();

      // A request can fail because of an HTTP error
      // or because the backend returned success: false.
      if (!response.ok || !data.success) {
        return {
          success: false,

          // Use the backend error where available.
          error:
            data.error ||
            'Account creation failed.',
        };
      }

      // Return the successful account result.
      return {
        success: true,
        message: data.message,
        user: data.data?.user,
        session: data.data?.session,
      };
    } catch (error) {
      // This normally occurs when the backend is stopped,
      // the API URL is wrong, or the network request fails.
      console.error('Signup error:', error);

      return {
        success: false,
        error: 'Could not connect to the server.',
      };
    }
  },
};


// 
// Main signup-page application
// Controls the form, validation, signup request,
// loading state, messages, and redirect.
// 

const App = {
  // Stores references to the signup-page HTML elements.
  el: {},

  // Runs after the HTML page has loaded.
  init() {
    App.el = {
      email: DOM.get('email'),
      username: DOM.get('username'),
      password: DOM.get('password'),
      confirmPassword: DOM.get(
        'confirmPassword'
      ),
      terms: DOM.get('terms'),

      emailErr: DOM.get('emailError'),
      usernameErr: DOM.get('usernameError'),
      passwordErr: DOM.get('passwordError'),
      confirmPasswordErr: DOM.get(
        'confirmPasswordError'
      ),

      btn: DOM.get('signupBtn'),
      successBanner: DOM.get(
        'successBanner'
      ),
    };

    // Submit the signup form when the button is clicked.
    App.el.btn?.addEventListener(
      'click',
      App.submit
    );

    // Also submit when the Enter key is pressed.
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Enter') {
          // Prevent the browser from performing
          // another default form submission.
          event.preventDefault();

          App.submit();
        }
      }
    );
  },

  // Clears previous errors and success messages.
  reset() {
    const {
      email,
      username,
      password,
      confirmPassword,
      emailErr,
      usernameErr,
      passwordErr,
      confirmPasswordErr,
      successBanner,
    } = App.el;

    DOM.clearError(email, emailErr);
    DOM.clearError(username, usernameErr);
    DOM.clearError(password, passwordErr);

    DOM.clearError(
      confirmPassword,
      confirmPasswordErr
    );

    DOM.hide(
      successBanner,
      'is-visible'
    );
  },

  // Runs when the user submits the signup form.
  async submit(event) {
    // Prevent normal HTML form submission when
    // this function receives a browser event.
    event?.preventDefault();

    const {
      email,
      username,
      password,
      confirmPassword,
      terms,
      btn,
      emailErr,
      usernameErr,
      passwordErr,
      confirmPasswordErr,
      successBanner,
    } = App.el;

    // Read and clean the form values.
    const emailVal = email.value
      .trim()
      .toLowerCase();

    const usernameVal =
      username.value.trim();

    const passwordVal =
      password.value;

    const confirmPasswordVal =
      confirmPassword.value;

    const termsChecked =
      terms.checked;

    // Remove messages from any previous attempt.
    App.reset();

    // Validate the form before contacting the backend.
    const errors = Validator.run(
      emailVal,
      usernameVal,
      passwordVal,
      confirmPasswordVal,
      termsChecked
    );

    // Display each validation error beside
    // the appropriate input field.
    if (errors.email) {
      DOM.showError(
        email,
        errors.email,
        emailErr
      );
    }

    if (errors.username) {
      DOM.showError(
        username,
        errors.username,
        usernameErr
      );
    }

    if (errors.password) {
      DOM.showError(
        password,
        errors.password,
        passwordErr
      );
    }

    if (errors.confirmPassword) {
      DOM.showError(
        confirmPassword,
        errors.confirmPassword,
        confirmPasswordErr
      );
    }

    // The current HTML does not appear to have
    // a separate error element for the terms checkbox,
    // so the message is displayed as an alert.
    if (errors.terms) {
      alert(errors.terms);
    }

    // Do not contact the backend if validation failed.
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Disable the signup button while the
    // account request is being processed.
    DOM.setLoading(btn, true);

    try {
      // Send the validated form details to the backend.
      const result = await Auth.signup(
        emailVal,
        usernameVal,
        passwordVal
      );

      // Display the actual safe error returned
      // by the backend instead of using a fixed
      // "username already exists" message.
      if (!result.success) {
        DOM.showError(
          email,
          `❌ ${result.error}`,
          emailErr
        );

        return;
      }

      // Show the account-created message.
      if (successBanner) {
        successBanner.textContent =
          result.message ||
          'Account created successfully!';
      }

      DOM.show(
        successBanner,
        'is-visible'
      );

      // After successful signup, send the user
      // to the login page.
      //
      // The user is not automatically treated as
      // logged in after registration.
      setTimeout(() => {
        window.location.href =
          'login.html';
      }, 2000);
    } finally {
      // Always restore the button, whether
      // the request succeeds or fails.
      DOM.setLoading(btn, false);
    }
  },
};


// Wait until the HTML document is ready
// before accessing the signup-page elements.
document.addEventListener(
  'DOMContentLoaded',
  App.init.bind(App)
);