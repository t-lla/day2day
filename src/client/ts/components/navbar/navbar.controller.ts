/**
 * @packageDocumentation
 * @module NavbarController
 *
 * Controller for managing the navigation bar, including user login state
 * and routing interactions.
 */
import { NavbarView } from "./navbar.view.js";
import { NavbarModel } from "./navbar.model.js";
import { showMainMenu } from "../../router.js";
import { showEntryModal } from "../entry/entry.controller.js";

/**
 * NavbarController initializes and updates the navigation bar UI,
 * handling user interactions and reflecting authentication state.
 */
export class NavbarController {
  private model: NavbarModel;

  /** Creates a new instance of NavbarController and its associated model. */
  constructor() {
    this.model = new NavbarModel();
  }

  /**
   * Initializes the navbar by rendering its view and binding event listeners.
   *
   * @param selector - CSS selector of the container element for the navbar.
   * @returns A promise that resolves when view rendering is complete and events are set up.
   */
  async init(selector: string): Promise<void> {
    await NavbarView.render(selector);

    const logo = document.querySelector<HTMLElement>(".logo");
    const entry = document.querySelector<HTMLElement>(".entry");

    this.updateNavbar();

    if (logo) {
      logo.addEventListener("click", showMainMenu);
    }

    if (entry) {
      entry.addEventListener("click", () => {
        if (this.model.isLoggedIn()) {
          this.model.removeUser();
          window.location.reload();
        } else {
          showEntryModal();
        }
      });
    }
  }

  /**
   * Updates navbar view based on the current authentication state.
   * Displays the username if logged in, and toggles entry/logout text.
   */
  updateNavbar(): void {
    const isLoggedIn = this.model.isLoggedIn();
    const user = this.model.getUser();

    NavbarView.setUserInfo(isLoggedIn && user ? user.username : null);
    NavbarView.setEntryText(isLoggedIn ? "> logout" : "> entry");
  }
}
