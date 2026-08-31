function logoutUser() {
  const keys = [
    'userId',
    'userName',
    'userEmail',
    'accessToken',
    'refreshToken'
  ];

  // Clear persistent login data
  keys.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Clear temporary session data
  keys.forEach((key) => {
    sessionStorage.removeItem(key);
  });

  window.location.href = 'login.html';
}
