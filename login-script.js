

const CONFIG = {
  DEMO_EMAIL:    'coolkid123',
  DEMO_PASSWORD: 'rainbow',
  MIN_PASSWORD:  6,
  DELAY_MS:      1400,
};

const API_URL = 'http://localhost:3000';

const rememberMe = document.getElementById('rememberMe');
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
  run: (email, password) => {
    const errors = {};
    if (email.trim().length < 3) {
      errors.email = '⚠️ Please enter your username or email!';
    }
    if (password.length < CONFIG.MIN_PASSWORD) {
      errors.password = `⚠️ Password needs at least ${CONFIG.MIN_PASSWORD} characters!`;
    }
    return errors;
  },
};

const Auth = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password, rememberMe: rememberMe.checked })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Save user ID to localStorage
        localStorage.setItem('userId', data.data.user.id);
        localStorage.setItem('userName', data.data.user.full_name);
        localStorage.setItem('userEmail', data.data.user.email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
};

const App = {
 
  el: {},
  init() {
    App.el = {
      email:         DOM.get('email'),         
      password:      DOM.get('password'),      
      emailErr:      DOM.get('emailError'),    
      passwordErr:   DOM.get('passwordError'), 
      btn:           DOM.get('loginBtn'),      
      successBanner: DOM.get('successBanner'), 
    };
   
    App.el.btn.addEventListener('click', App.submit);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') App.submit();
    });
  },
  
  reset() {
    const { email, password, emailErr, passwordErr, successBanner } = App.el;
    DOM.clearError(email, emailErr);
    DOM.clearError(password, passwordErr);
    DOM.hide(successBanner, 'is-visible');
  },
 
  async submit() {
    const { email, password, btn, emailErr, passwordErr, successBanner } = App.el;
    const emailVal    = email.value.trim();
    const passwordVal = password.value;
    
    App.reset();
   
    const errors = Validator.run(emailVal, passwordVal);
    if (errors.email)    DOM.showError(email,    errors.email,    emailErr);
    if (errors.password) DOM.showError(password, errors.password, passwordErr);
    if (Object.keys(errors).length > 0) return;
    
    DOM.setLoading(btn, true);
    const success = await Auth.login(emailVal, passwordVal);
    DOM.setLoading(btn, false);
    
    if (success) {
      DOM.show(successBanner, 'is-visible');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      DOM.showError(email, '❌ Wrong username or password. Try again!', emailErr);
    }
  },
};

document.addEventListener('DOMContentLoaded', App.init.bind(App));
