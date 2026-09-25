// Live translation for the words parents write (entry titles and stories).
// The app's own labels are translated by i18n.js from a fixed phrase list;
// this is for content that cannot be known in advance.

// Ask the backend to translate one piece of text. The backend talks to the
// translation service, so no key is exposed here.
async function translateText(text, from, to) {
  // Parents and clinicians keep their session under different names.
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('clinicianAccessToken') ||
    sessionStorage.getItem('clinicianAccessToken');

  const response = await fetch(`${API_URL}/api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text, from, to })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || t('translate_failed'));
  }

  return data.data.text;
}

// Guess what a piece of text is written in, so the button can offer the
// other language. Turkish letters are a reliable giveaway; otherwise this
// assumes English, and the person can still translate either way.
function looksTurkish(text) {
  return /[çğıöşüÇĞİÖŞÜ]/.test(text);
}

// Add a translate button that swaps the given elements between languages
// and back. `parts` is a list of { element, original } pairs.
function addTranslateButton(container, parts) {
  const source = parts.map((p) => p.original).join(' ');
  const from = looksTurkish(source) ? 'tr' : 'en';
  const to = from === 'tr' ? 'en' : 'tr';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'translate-btn';
  button.textContent =
    to === 'tr' ? t('translate_to_tr') : t('translate_to_en');

  const status = document.createElement('span');
  status.className = 'translate-status';
  status.setAttribute('aria-live', 'polite');

  let showingTranslation = false;
  let translated = null;

  button.addEventListener('click', async () => {
    // Second click: put the parent's own words back.
    if (showingTranslation) {
      parts.forEach((part) => {
        part.element.textContent = part.original;
      });

      showingTranslation = false;
      status.textContent = '';
      button.textContent =
        to === 'tr' ? t('translate_to_tr') : t('translate_to_en');

      return;
    }

    // Translate once, then reuse it for later clicks.
    if (!translated) {
      button.disabled = true;
      status.textContent = t('translating');

      try {
        translated = await Promise.all(
          parts.map((part) => translateText(part.original, from, to))
        );
      } catch (error) {
        console.error('Translation error:', error);
        status.textContent = error.message;
        button.disabled = false;

        return;
      }

      button.disabled = false;
    }

    parts.forEach((part, index) => {
      part.element.textContent = translated[index];
    });

    showingTranslation = true;
    status.textContent = t('translated_by');
    button.textContent = t('show_original');
  });

  container.appendChild(button);
  container.appendChild(status);
}
