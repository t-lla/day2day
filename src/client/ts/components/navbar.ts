import { loadComponent } from './loader.js';
import { showMainMenu } from '../router.js';
import { initEntry, showEntryModal } from './entry.js';

export async function initNavbar(): Promise<void> {
  await loadComponent("#navbar", "../../components/navbar.html");
  await initEntry(); // pre-load entry

  const logo = document.querySelector<HTMLElement>('.logo');
  const entry = document.querySelector<HTMLElement>('.entry');
  const userInfo = document.querySelector<HTMLElement>('.user-info');

  const user = localStorage.getItem('user');
  const isLoggedIn = !!user;

  if (entry) {
    if (isLoggedIn && userInfo) {

      const userData = JSON.parse(user);
      userInfo.textContent = userData.username;
      entry.textContent = '> logout'; //if user logged, show logout
      
      entry.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.reload();
      });
    } else {
      entry.textContent = '> entry';
      entry.addEventListener('click', showEntryModal);
    }
  }

  if (logo) {
    logo.addEventListener('click', showMainMenu);
  }
}