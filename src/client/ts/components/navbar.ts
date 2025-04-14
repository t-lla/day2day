import { loadComponent } from './loader.js';
import { showMainMenu } from '../router.js';


export async function initNavbar(): Promise<void> {
  await loadComponent("#navbar", "../../components/navbar.html");

  const logo = document.querySelector('.logo');
  const entry = document.querySelector('.entry');

  if (logo) {
    logo.addEventListener('click', () => {
      showMainMenu();
    });
  }

  if (entry) {
    entry.addEventListener('click', () => {
      console.log('Entry clicked');

    });
  }
}