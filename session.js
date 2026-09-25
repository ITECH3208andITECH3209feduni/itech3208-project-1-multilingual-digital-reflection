// Wires up the sidebar user-card dropdown (Log out / Switch account).
// Included on every page that renders the sidebar: index, new-entry, weekly, add-child.

const SELECTED_CHILD_KEYS = [
  'selectedChildId',
  'selectedChildName',
  'selectedChildAvatar'
];

// "Remember me" decides where a session lives: localStorage when ticked,
// sessionStorage when not.
function getSessionStorageArea() {
  return localStorage.getItem('accessToken') ? localStorage : sessionStorage;
}

function clearSelectedChild() {
  SELECTED_CHILD_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

// Record which child the parent is working with.
//
// Readers check localStorage before sessionStorage, so a selection left
// behind in the other one would quietly win over this one: picking a second
// child would appear to work while every save still used the first. Writing
// the choice in one place only keeps that from happening.
function storeSelectedChild(child) {
  const storage = getSessionStorageArea();

  clearSelectedChild();

  storage.setItem('selectedChildId', child.id);
  storage.setItem('selectedChildName', child.name);
  storage.setItem('selectedChildAvatar', child.avatar || '👶');
}

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
