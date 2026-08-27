// Wires up the sidebar user-card dropdown (Log out / Switch account).
// Included on every page that renders the sidebar: index, new-entry, weekly, add-child.

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('userCardTrigger');
  const menu = document.getElementById('accountMenu');
  if (!trigger || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  };

  trigger.addEventListener('click', toggleMenu);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu(event);
    } else if (event.key === 'Escape') {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !trigger.contains(event.target)) {
      closeMenu();
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logoutUser();
  });

  document.getElementById('switchAccountBtn')?.addEventListener('click', () => {
    logoutUser();
  });
});
