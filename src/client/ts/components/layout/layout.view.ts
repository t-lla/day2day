/**
 * @packageDocumentation
 * @module LayoutView
 *
 * Provides static methods to load the layout HTML template and inject it into a DOM element.
 */
import { loadComponent } from "../loader.js";

/**
 * LayoutView offers static functions to load and display the application's
 * layout template into a specified DOM container.
 */
export class LayoutView {
  /**
   * Renders the layout HTML template into the specified DOM container.
   * Uses the loadComponent utility to fetch and inject the template.
   *
   * @param selector - CSS selector of the element where the layout will be injected.
   * @returns A promise that resolves when the component has been loaded.
   */
  static render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/layout.html");
  }
}
