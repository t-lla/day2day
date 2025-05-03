/**
 * @packageDocumentation
 * @module PortalController
 *
 * Controller responsible for initializing the intro portal screen view and
 * handling navigation, through the router, to the main application.
 */
import { PortalView } from "./portal.view.js";
import { navigateToApp } from "../../router.js";

/**
 * PortalController initializes the portal UI and binds interaction
 * events, such as skipping the intro to navigate into the app.
 */
export class PortalController {
  /**
   * Renders the portal component into the specified container and
   * sets up event listener for skipping the intro.
   *
   * @param selector - CSS selector of the element where the portal will be injected.
   * @returns A promise that resolves when the portal has been rendered.
   * @example
   * const controller = new PortalController();
   * await controller.init('#portalScreen');
   */
  async init(selector: string): Promise<void> {
    await PortalView.render(selector);

    const skipLink = document.querySelector(".skip-intro");
    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToApp();
      });
    }
  }
}
