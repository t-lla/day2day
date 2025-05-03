/**
 * @packageDocumentation
 * @module SidebarView
 *
 * Provides methods for rendering and updating the sidebar UI component.
 * Provides static methods to load the sidebar HTML template and highlight selected items.
 */
import { loadComponent } from "../loader.js";

/**
 * Manages the UI rendering and selection state of the sidebar.
 * Inject the sidebar template and updates item highlighting.
 */
export class SidebarView {
  /**
   * Renders the sidebar HTML component into the specified DOM container.
   * Uses the loadComponent utility to fetch and inject the template.
   *
   * @param selector - CSS selector of the element where the sidebar will be injected.
   * @returns A promise that resolves when the component has been loaded.
   * @throws Will throw an error if the selector is invalid or the HTML file cannot be fetched.
   * @example
   * await SidebarView.render('#sidebar');
   */
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/sidebar.html");
  }

  /**
   * Highlights the sidebar item at the specified index.
   * Adds the 'selected' class to the chosen item and removes it from others.
   *
   * @param index - Zero-based index of the item to highlight.
   * @param treeItems - Array of sidebar list items (LI elements) to update.
   * @example
   * const items = document.querySelectorAll('#treeSide li') as NodeListOf<HTMLLIElement>;
   * SidebarView.highlightSelection(0, Array.from(items));
   */
  static highlightSelection(index: number, treeItems: HTMLLIElement[]): void {
    treeItems.forEach((item, i) => {
      item.classList.toggle("selected", i === index);
    });
  }
}
