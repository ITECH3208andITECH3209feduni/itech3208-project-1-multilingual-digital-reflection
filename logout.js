function logoutUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  window.location.href = 'login.html';
}
