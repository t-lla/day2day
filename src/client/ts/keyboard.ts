/**
 * @packageDocumentation
 * @module GlobalKeyboardNavigation
 *
 * Provides keyboard navigation for the sidebar, enabling
 * moving through and selecting the different sections via arrow
 * and enter keys(when no input is focused).
 */
import {
  nextSidebarItem,
  prevSidebarItem,
  activateSidebarItem,
} from "./components/sidebar/sidebar.controller.js";

/**
 * Initializes keyboard event listeners to navigate the sidebar.
 *
 * - ArrowDown: Move to next sidebar item
 * - ArrowUp: Move to previous sidebar item
 * - Enter: Activate the selected sidebar item
 *
 * @remarks Listeners are disabled when an input or textarea element is focused.
 */
export function initGlobalKeyboardNavigation(): void {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    // if focus is in an input or textarea, skip navigation keys
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        nextSidebarItem();
        e.preventDefault();
        break;
      case "ArrowUp":
        prevSidebarItem();
        e.preventDefault();
        break;
      case "Enter":
        activateSidebarItem();
        e.preventDefault();
        break;
      default:
        break;
    }
  });
}
