import { LayoutController } from "./components/layout/layout.controller.js";
import { NavbarController } from "./components/navbar/navbar.controller.js";
import { initSidebar } from "./components/sidebar/sidebar.controller.js";
import { PortalController } from "./components/portal/portal.controller.js";
import { initRouter } from "./router.js";
import { initGlobalKeyboardNavigation } from "./keyboard.js";

async function initApp(): Promise<void> {
  await LayoutController.init("#app-root"); //loads overall layout

  const navbarController = new NavbarController();
  await navbarController.init("#navbar");

  await initSidebar();
  const portalController = new PortalController();
  await portalController.init("#portalScreen");

  initRouter();
  initGlobalKeyboardNavigation();
}

initApp();