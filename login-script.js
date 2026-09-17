

const CONFIG = {
  DEMO_EMAIL:    'coolkid123',
  DEMO_PASSWORD: 'rainbow',
  MIN_PASSWORD:  6,
  DELAY_MS:      1400,
};

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin;

  const SUPABASE_URL = 'https://axhirebelwkzsncellxh.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_wvas5PH4QFod9WraSdtNmQ_3zXTqmqP';


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
      // Get the checkbox after the page has loaded.
      // If it does not exist, default to false.
      const rememberMe =
        document.getElementById('rememberMe')?.checked ?? false;
        console.log('Remember Me value:', rememberMe);

      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY
        },

        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        return {
          success: true,
          data: {
            user: {
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || email,
              email: data.user.email
            },
            session: {
              access_token: data.access_token,
              refresh_token: data.refresh_token
            }
          }
        };
      }

      console.log('Login response:', response.status, data);

      if (response.ok && data.success) {
        const storage = rememberMe
          ? localStorage
          : sessionStorage;

        // Clear any previous login/session data
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
        storage.setItem('userId', data.data.user.id);
        storage.setItem('userName', data.data.user.full_name);
        storage.setItem('userEmail', data.data.user.email);

        // Store Supabase session
        if (data.data.session) {
          storage.setItem(
            'accessToken',
            data.data.session.access_token
          );

          storage.setItem(
            'refreshToken',
            data.data.session.refresh_token
          );
        }
      } else {
        console.error('Login rejected:', data);
      }

      return data;
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
    } else {
      DOM.showError(email, '❌ Wrong username or password. Try again!', emailErr);
    }
  },
};

document.addEventListener('DOMContentLoaded', App.init.bind(App));
