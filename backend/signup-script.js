// Signup Script for StoryBond

const CONFIG = {
  MIN_PASSWORD: 6,
  DELAY_MS: 1400,
};

const DOM = {
  get: (id) => document.getElementById(id),
  show: (el, cls) => el.classList.add(cls),
  hide: (el, cls) => el.classList.remove(cls),
  
  showError: (input, msg, errorEl) => {
    input.classList.add('is-error');      
    errorEl.textContent = msg;
    errorEl.classList.add('is-visible'); 
  },
  
  clearError: (input, errorEl) => {
    input.classList.remove('is-error');
    errorEl.classList.remove('is-visible');
    errorEl.textContent = '';
  },
  
  setLoading: (btn, on) => {
    btn.disabled = on;
    if (on) {
      btn.classList.add('is-loading');    
    } else {
      btn.classList.remove('is-loading');
    }
  },
};

const Validator = {
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  run: (email, username, password, confirmPassword, termsChecked) => {
    const errors = {};

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.email = '⚠️ Please enter your email address!';
    } else if (!Validator.validateEmail(email)) {
      errors.email = '⚠️ Please enter a valid email address!';
    }

    // Username validation
    if (!username || username.trim().length < 3) {
      errors.username = '⚠️ Username must be at least 3 characters!';
    }

    // Password validation
    if (password.length < CONFIG.MIN_PASSWORD) {
      errors.password = `⚠️ Password needs at least ${CONFIG.MIN_PASSWORD} characters!`;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = '⚠️ Passwords do not match!';
    }

    // Terms validation
    if (!termsChecked) {
      errors.terms = '⚠️ You must agree to the Terms & Conditions!';
    }

    return errors;
  },
};

const Auth = {
  signup: (email, username, password) => {
    return new Promise((resolve) => {
      // Simulating account creation delay
      setTimeout(() => {
        // For demo purposes, always succeed
        // In production, this would call your backend API
        console.log('Account created:', { email, username });
        resolve(true);
      }, CONFIG.DELAY_MS);
    });
  },
};

const App = {
  el: {},

  init() {
    App.el = {
      email:              DOM.get('email'),         
      username:           DOM.get('username'),      
      password:           DOM.get('password'),      
      confirmPassword:    DOM.get('confirmPassword'),
      terms:              DOM.get('terms'),
      emailErr:           DOM.get('emailError'),    
      usernameErr:        DOM.get('usernameError'), 
      passwordErr:        DOM.get('passwordError'), 
      confirmPasswordErr: DOM.get('confirmPasswordError'),
      btn:                DOM.get('signupBtn'),      
      successBanner:      DOM.get('successBanner'), 
    };

    // Button click handler
    App.el.btn.addEventListener('click', App.submit);

    // Enter key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') App.submit();
    });
  },

  reset() {
    const { email, username, password, confirmPassword, emailErr, usernameErr, passwordErr, confirmPasswordErr, successBanner } = App.el;
    DOM.clearError(email, emailErr);
    DOM.clearError(username, usernameErr);
    DOM.clearError(password, passwordErr);
    DOM.clearError(confirmPassword, confirmPasswordErr);
    DOM.hide(successBanner, 'is-visible');
  },

  async submit() {
    const { email, username, password, confirmPassword, terms, btn, emailErr, usernameErr, passwordErr, confirmPasswordErr, successBanner } = App.el;

    const emailVal            = email.value.trim();
    const usernameVal         = username.value.trim();
    const passwordVal         = password.value;
    const confirmPasswordVal  = confirmPassword.value;
    const termsChecked        = terms.checked;

    // Clear previous errors
    App.reset();

    // Validate form
    const errors = Validator.run(emailVal, usernameVal, passwordVal, confirmPasswordVal, termsChecked);
    
    if (errors.email)           DOM.showError(email,           errors.email,           emailErr);
    if (errors.username)        DOM.showError(username,        errors.username,        usernameErr);
    if (errors.password)        DOM.showError(password,        errors.password,        passwordErr);
    if (errors.confirmPassword) DOM.showError(confirmPassword, errors.confirmPassword, confirmPasswordErr);
    
    if (errors.terms) {
      // Show terms error near the button
      alert(errors.terms);
    }

    // Stop if there are any errors
    if (Object.keys(errors).length > 0) return;

    // Submit form
    DOM.setLoading(btn, true);
    const success = await Auth.signup(emailVal, usernameVal, passwordVal);
    DOM.setLoading(btn, false);
    
    if (success) {
      DOM.show(successBanner, 'is-visible');
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      DOM.showError(email, '❌ Something went wrong. Please try again!', emailErr);
    }
  },
};

document.addEventListener('DOMContentLoaded', App.init.bind(App));
