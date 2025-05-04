/**
 * @packageDocumentation
 * @module Main
 *
 * Entry point for initializing the application layout, navbar,
 * sidebar, habits section, portal, router, and keyboard navigation.
 */
import { LayoutController } from "./components/layout/layout.controller.js";
import { NavbarController } from "./components/navbar/navbar.controller.js";
import { initSidebar } from "./components/sidebar/sidebar.controller.js";
import { initHabits } from "./components/habits/habits.controller.js";
import { PortalController } from "./components/portal/portal.controller.js";
import { initRouter } from "./router.js";
import { initGlobalKeyboardNavigation } from "./keyboard.js";

/**
 * Initializes the application components in sequence:
 * 1. Layout
 * 2. Navbar
 * 3. Sidebar
 * 4. Habits
 * 5. Portal
 * 6. Router
 * 7. Keyboard navigation
 *
 * @async
 * @function initApp
 * @returns Promise<void> resolves when all tasks are initialized.
 */
async function initApp(): Promise<void> {
  await LayoutController.init("#app-root");

  const navbarController = new NavbarController();
  await navbarController.init("#navbar");

  await initSidebar();

  await initHabits();

  const portalController = new PortalController();
  await portalController.init("#portalScreen");

  initRouter();

  initGlobalKeyboardNavigation();
}

// bootstrap the application
initApp();