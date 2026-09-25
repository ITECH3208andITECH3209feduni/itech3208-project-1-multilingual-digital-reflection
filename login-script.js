

const CONFIG = {
  DEMO_EMAIL:    'coolkid123',
  DEMO_PASSWORD: 'rainbow',
  MIN_PASSWORD:  6,
  DELAY_MS:      1400,
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
  login: async (loginIdentifier, password) => {
    try {
      // Get the checkbox after the page has loaded.
      // If it does not exist, default to false.
      const rememberMe =
        document.getElementById('rememberMe')?.checked ?? false;
        console.log('Remember Me value:', rememberMe);

      // Log in through the backend, which accepts a username OR an email.
      // Supabase itself only accepts an email, so calling it directly here
      // rejected every account that signs in with a username.
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          loginIdentifier,
          password
        })
      });

      const data = await response.json();

      console.log('Login response:', response.status, data);

      if (response.ok && data.success) {
        const user = data.data.user;
        const session = data.data.session;
        const storage = rememberMe
          ? localStorage
          : sessionStorage;

        // Clear any previous login/session data from BOTH storages,
        // so a stale token from a prior session never lingers.
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');

        // Store current user
        storage.setItem('userId', user.id);
        storage.setItem('userName', user.full_name || user.username || loginIdentifier);
        storage.setItem('userEmail', user.email);

        // Store Supabase session tokens
        storage.setItem('accessToken', session.access_token);
        storage.setItem('refreshToken', session.refresh_token);

        return {
          success: true,
          data: {
            user,
            session
          }
        };
      }

      // The backend tells "no such account" apart from "wrong password",
      // so the page can offer to sign the person up instead. Only its explicit
      // code means that: a 404 is also returned when the account exists but has
      // no StoryBond profile, and that needs its own message, not "sign up".
      if (data.code === 'USER_NOT_FOUND') {
        return { success: false, code: 'USER_NOT_FOUND' };
      }

      console.error('Login rejected:', data);
      return { success: false, error: data.error || 'unknown' };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'network' };
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
      signupPrompt:  DOM.get('signupPrompt'),
      signupLink:    DOM.get('signupPromptLink'),
    };
   
    App.el.btn.addEventListener('click', App.submit);
    
    document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !App.el.btn.disabled) {
    e.preventDefault();
    App.submit();
      }
    });
  },
  
  reset() {
    const { email, password, emailErr, passwordErr, successBanner, signupPrompt } = App.el;
    DOM.clearError(email, emailErr);
    DOM.clearError(password, passwordErr);
    DOM.hide(successBanner, 'is-visible');
    DOM.hide(signupPrompt, 'is-visible');
  },

  async submit() {
    const { email, password, btn, emailErr, passwordErr, successBanner, signupPrompt, signupLink } = App.el;
    const emailVal    = email.value.trim();
    const passwordVal = password.value;

    App.reset();

    const errors = Validator.run(emailVal, passwordVal);
    if (errors.email)    DOM.showError(email,    errors.email,    emailErr);
    if (errors.password) DOM.showError(password, errors.password, passwordErr);
    if (Object.keys(errors).length > 0) return;

    DOM.setLoading(btn, true);
    const result = await Auth.login(emailVal, passwordVal);
    DOM.setLoading(btn, false);

    if (result.success) {
      DOM.show(successBanner, 'is-visible');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else if (result.code === 'USER_NOT_FOUND') {
      DOM.showError(email, "❌ This user doesn't exist!", emailErr);
      signupLink.href = `signup.html?email=${encodeURIComponent(emailVal)}`;
      DOM.show(signupPrompt, 'is-visible');
    } else if (result.error === 'network') {
      DOM.showError(
        email,
        '❌ Cannot reach StoryBond right now. Check your connection and try again.',
        emailErr
      );
    } else if (result.error && result.error !== 'unknown') {
      // Show what the server actually said (unconfirmed email, missing
      // profile, ...) instead of blaming the password for every failure.
      DOM.showError(email, `❌ ${result.error}`, emailErr);
    } else {
      DOM.showError(email, '❌ Wrong username or password. Try again!', emailErr);
    }
  },
};

document.addEventListener('DOMContentLoaded', App.init.bind(App));
