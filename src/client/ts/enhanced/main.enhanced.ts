/**
 * @packageDocumentation
 * @module MainEnhanced
 *
 * Enhanced main entry point with authentication and sync integration.
 */

import { LayoutController } from "../components/layout/layout.controller.js"
import { NavbarController } from "../components/navbar/navbar.controller.js"
import { initSidebar } from "../components/sidebar/sidebar.controller.js"
import { PortalController } from "../components/portal/portal.controller.js"
import { initRouter } from "../router.js"
import { initGlobalKeyboardNavigation } from "../keyboard.js"
import { authController } from "../components/auth/auth.controller.js"
import { syncStatusController } from "../components/sync-status/sync-status.controller.js"
import { apiService } from "../services/api.service.js"
import { storageService } from "../services/storage.service.js"
import { syncService } from '../services/sync.service.js';

async function initApp(): Promise<void> {
  await LayoutController.init("#app-root")

  const navbarController = new NavbarController()
  await navbarController.init("#navbar")

  syncStatusController.init(".user-info")

  await authController.init("#entry-container")

  setupAuthFlow()

  await syncService.initialLoad()

  await initSidebar()

  const portalController = new PortalController()
  await portalController.init("#portalScreen")

  initRouter()
  initGlobalKeyboardNavigation()
}

function setupAuthFlow(): void {
  const user = localStorage.getItem("user")
  const isOffline = localStorage.getItem("offline_mode") === "true"

  if (!user && !isOffline) {
    setTimeout(() => authController.showModal(), 0)
  }

  const entryElement = document.querySelector(".entry")
  entryElement?.addEventListener("click", () => {


    if (apiService.isAuthenticated()) {
      if (confirm("Are you sure you want to logout?")) {
        apiService.logout()
        storageService.clearNamespace()
        localStorage.removeItem("user")
        localStorage.removeItem("offline_mode")
        window.location.reload()
      }
    } else {
      authController.showModal()
    }
  })
}

initApp()
