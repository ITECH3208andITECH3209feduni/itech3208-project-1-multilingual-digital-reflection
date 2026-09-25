function logoutUser() {
  const keys = [
    'userId',
    'userName',
    'userEmail',
    'accessToken',
    'refreshToken',
    // The chosen child belongs to the session too: leaving it behind meant
    // the next person to log in inherited it, and it overrode their own pick.
    'selectedChildId',
    'selectedChildName',
    'selectedChildAvatar'
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
