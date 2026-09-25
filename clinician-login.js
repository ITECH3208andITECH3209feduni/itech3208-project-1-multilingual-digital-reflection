
const CLINICIAN_STORAGE_KEYS = [
  'clinicianId',
  'clinicianName',
  'clinicianEmail',
  'clinicianProfession',
  'clinicianOrganisation',
  'clinicianAccessToken',
  'clinicianRefreshToken'
];

function clearClinicianSession() {
  CLINICIAN_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

async function loginClinician(email, password, rememberMe) {
  const response = await fetch(
    `${API_URL}/api/auth/clinician/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || t('unable_signin'));
  }

  const clinician = data.data?.user;
  const session = data.data?.session;

  if (!clinician || !session?.access_token) {
    throw new Error(t('session_not_created'));
  }

  clearClinicianSession();

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem('clinicianId', clinician.id);
  storage.setItem('clinicianName', clinician.full_name || '');
  storage.setItem('clinicianEmail', clinician.email || '');
  storage.setItem('clinicianProfession', clinician.profession || '');
  storage.setItem('clinicianOrganisation', clinician.organisation || '');
  storage.setItem('clinicianAccessToken', session.access_token);

  if (session.refresh_token) {
    storage.setItem('clinicianRefreshToken', session.refresh_token);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('clinicianLoginForm');
  const emailInput = document.getElementById('clinicianEmail');
  const passwordInput = document.getElementById('clinicianPassword');
  const rememberMe = document.getElementById('clinicianRememberMe');
  const loginButton = document.getElementById('clinicianLoginButton');
  const message = document.getElementById('clinicianLoginMessage');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    message.textContent = '';
    message.className = 'form-message';
    loginButton.disabled = true;
    loginButton.textContent = t('signing_in');

    try {
      await loginClinician(
        emailInput.value.trim(),
        passwordInput.value,
        rememberMe.checked
      );

      message.textContent = t('signin_success');
      message.classList.add('success');

      window.location.href = 'clinician-dashboard.html';
    } catch (error) {
      console.error('Clinician login error:', error);
      message.textContent = error.message;
      message.classList.add('error');
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = t('signin_btn');
    }
  });
});