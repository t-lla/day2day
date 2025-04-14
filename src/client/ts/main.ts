import { loadLayout } from './components/layout.js';
import { initNavbar } from './components/navbar.js';
import { initSidebar } from './components/sidebar.js';
import { initPortal } from './components/portal.js';
import { initRouter } from './router.js';
import { initGlobalKeyboardNavigation } from './keyboard.js';

async function initApp(): Promise<void> {

  await loadLayout(); //loads overall layout

  await initNavbar();
  await initSidebar();
  await initPortal();

  initRouter();
  initGlobalKeyboardNavigation();
}

initApp();
