/**
 * @packageDocumentation
 * @module NavbarView
 *
 * Provides methods for rendering and updating the navigation bar UI.
 */
import { loadComponent } from "../loader.js";

/**
 * NavbarView offers static functions to load the navbar template
 * and manipulate its display based on user authentication state.
 */
export class NavbarView {
  /**
   * Renders the navbar HTML component into the specified container.
   *
   * @param selector - CSS selector of the element where the navbar will be injected.
   * @returns A promise that resolves when the component has been loaded.
   */
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/navbar.html");
  }

  /**
   * Updates the entry element's text (e.g., "> entry" or "> logout").
   *
   * @param text - The text to display in the entry element.
   */
  static setEntryText(text: string): void {
    const entry = document.querySelector<HTMLElement>(".entry");
    if (entry) {
      entry.textContent = text;
    }
  }

  /**
   * Updates the user-info element to display the username or clears it.
   *
   * @param username - The username to display, or null to clear.
   * @example
   * NavbarView.setUserInfo("user1");
   * //userInfo.textContent = "user1"
   */
  static setUserInfo(username: string | null): void {
    const userInfo = document.querySelector<HTMLElement>(".user-info");
    if (userInfo) {
      userInfo.textContent = username || "";
    }
  }
}
