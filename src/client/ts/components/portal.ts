import { loadComponent } from './loader.js';
import { navigateToApp } from '../router.js';


export async function initPortal(): Promise<void> {
  await loadComponent("#portalScreen", "../../components/portal.html");

  const skipLink = document.querySelector('.skip-intro');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToApp();
    });
  }
}
