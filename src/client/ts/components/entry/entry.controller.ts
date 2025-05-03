/**
 * @packageDocumentation
 * @module EntryController
 *
 * Display and behavior of the entry modal 
 * for user authentication (login and signup).
 * Rendering, event handling and user authentication actions
 * alongside EntryModel and EntryView.
 */

import { EntryView } from "./entry.view.js";
import { EntryModel } from "./entry.model.js";

/** Singleton instance of the EntryController. */
let entryController: EntryController | null = null;

/**
 * Main controller for the entry modal.
 * Initializes the modal, binds event handlers, and manages form submissions for login and signup.
 */
export class EntryController {
  private model: EntryModel;

  /** Creates a new instance of EntryController and initializes its model. */
  constructor() {
    this.model = new EntryModel();
  }

  /**
   * Renders the entry modal into a specified DOM container and sets up event handlers.
   *
   * @param selector - CSS selector of the container where the modal will be injected.
   * @returns A promise that resolves when rendering and event binding are complete.
   * @example
   * await controller.init('#entry-container');
   */
  async init(selector: string): Promise<void> {
    await EntryView.render(selector);

    const overlay = document.getElementById("entry-overlay") as HTMLDivElement;
    const closeBtn = document.getElementById("close-entry") as HTMLElement;
    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    const signupForm = document.getElementById("signup-form") as HTMLFormElement;

    overlay?.addEventListener("click", this.hideEntryModal);
    closeBtn?.addEventListener("click", this.hideEntryModal);

    //(login or signup)
    const sidebarItems = document.querySelectorAll( ".terminal-tree li" ) as NodeListOf<HTMLElement>;
    sidebarItems.forEach((item) => {
      item.addEventListener("click", () => {
        const formType = item.getAttribute("data-form") as "login" | "signup";
        EntryView.setSelectedForm(formType);
      });
    });

    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = ( document.getElementById("username") as HTMLInputElement ).value;
      const password = ( document.getElementById("password") as HTMLInputElement ).value;

      console.log(`Login attempt: ${username}`);

      this.model.setUser({ username, name: username });
      this.hideEntryModal();
      window.location.reload();
    });

    signupForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = ( document.getElementById("newUsername") as HTMLInputElement ).value;
      const password = ( document.getElementById("newPassword") as HTMLInputElement ).value;
      const confirmPassword = ( document.getElementById("confirmPassword") as HTMLInputElement ).value;

      if (password !== confirmPassword) {
        const errorElement = document.getElementById("signup-error");
        if (errorElement) {
          errorElement.textContent = "Passwords do not match";
        }
        return;
      }

      console.log(`Register attempt: ${username}`);

      this.model.setUser({ username, name: username });
      this.hideEntryModal();
      window.location.reload();
    });
  }

  /** Displays the entry modal in login mode and focuses on the username input. */
  showEntryModal(): void {
    EntryView.showModal();
    EntryView.setSelectedForm("login");

    setTimeout(() => {
      (document.getElementById("username") as HTMLInputElement)?.focus();
    }, 100);
  }

  /** Hides the entry modal. */
  hideEntryModal(): void {
    EntryView.hideModal();
  }

  /**
   * Checks for existing modal elements and initializes if necessary before showing.
   *
   * @returns A promise that resolves when the modal is shown.
   */
  async ensureShow(): Promise<void> {
    if (!entryController) {
      entryController = new EntryController();
    }
    if (
      !document.getElementById("entry-overlay") ||
      !document.getElementById("entry-modal")
    ) {
      await entryController.init("#entry-container");
    }
    this.showEntryModal();
  }
}

/**
 * Initializes the entry controller and renders the modal in the container.
 *
 * @returns A promise that resolves when initialization is complete.
 */
export function initEntry(): Promise<void> {
  if (!entryController) {
    entryController = new EntryController();
  }
  return entryController.init("#entry-container");
}

/**
 * Displays the entry modal, initializing if necessary.
 *
 * @returns A promise that resolves when the modal is displayed.
 */
export function showEntryModal(): Promise<void> {
  if (!entryController) entryController = new EntryController();
  return entryController.ensureShow();
}
