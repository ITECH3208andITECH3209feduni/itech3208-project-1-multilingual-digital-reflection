// Signup Script for StoryBond

const API_URL = 'https://itech3208-project-1-multilingual-digital-reflection-72kqb5g7x.vercel.app';


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
  signup: async (email, username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          username: username,
          password: password,
          full_name: username
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Save user info to localStorage
        localStorage.setItem('userId', data.data.user.id);
        localStorage.setItem('userName', data.data.user.username);
        localStorage.setItem('userEmail', data.data.user.email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
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
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      DOM.showError(email, '❌ Username or email already exists!', emailErr);
    }
  },
};

document.addEventListener('DOMContentLoaded', App.init.bind(App));
