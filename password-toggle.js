// Adds a show/hide (eye) button to every password box on the page.
// Included on login, signup, reset password and clinician login, which each
// style their inputs differently, so the button is built here rather than
// pasted into four pages.

const EYE_OPEN_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>`;

// Same eye with a line through it: the password is currently visible.
const EYE_CLOSED_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>`;

function labelFor(isVisible) {
  // i18n.js translates these after it loads; this is the English fallback.
  return isVisible ? 'Hide password' : 'Show password';
}

function addPasswordToggle(input) {
  if (input.dataset.hasToggle === 'true') return;
  input.dataset.hasToggle = 'true';

  // Reuse the page's own input wrapper when it has one, so the button sits
  // inside the existing box instead of below it.
  let wrapper = input.parentElement;

  if (!wrapper || !wrapper.classList.contains('pw-wrap')) {
    const wrapperIsPositioned =
      wrapper &&
      (wrapper.classList.contains('field__input-wrap') ||
        wrapper.classList.contains('auth-input-wrapper'));

    if (!wrapperIsPositioned) {
      // Bare input (clinician login): give it a wrapper of its own.
      const ownWrapper = document.createElement('div');
      ownWrapper.className = 'pw-wrap';
      input.parentElement.insertBefore(ownWrapper, input);
      ownWrapper.appendChild(input);
      wrapper = ownWrapper;
    }
  }

  wrapper.classList.add('pw-has-toggle');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pw-toggle';
  button.innerHTML = EYE_OPEN_ICON;
  button.setAttribute('aria-label', labelFor(false));
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('data-i18n-aria-label', 'show_password');
  button.title = labelFor(false);

  button.addEventListener('click', () => {
    const nowVisible = input.type === 'password';

    input.type = nowVisible ? 'text' : 'password';
    button.innerHTML = nowVisible ? EYE_CLOSED_ICON : EYE_OPEN_ICON;
    button.setAttribute('aria-pressed', String(nowVisible));
    button.setAttribute(
      'data-i18n-aria-label',
      nowVisible ? 'hide_password' : 'show_password'
    );

    // Re-apply the chosen language to the new label, if i18n.js is loaded.
    if (typeof applyLanguage === 'function') {
      applyLanguage(localStorage.getItem('storybondLang') || 'en');
    } else {
      button.setAttribute('aria-label', labelFor(nowVisible));
      button.title = labelFor(nowVisible);
    }

    // Keep the caret where the person was typing.
    input.focus();
  });

  wrapper.appendChild(button);
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('input[type="password"]')
    .forEach(addPasswordToggle);
});
