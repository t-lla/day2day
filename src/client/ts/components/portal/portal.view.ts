/**
 * @packageDocumentation
 * @module PortalView
 *
 * Provides methods for rendering the introductory portal screen UI component.
 */
import { loadComponent } from "../loader.js";

/**
 * PortalView offers static functions to inject and display the portal HTML
 * template within the application container.
 */
export class PortalView {
  /**
   * Renders the portal HTML component into the specified container.
   * Uses the loadComponent utility to fetch and inject the template.
   *
   * @param selector - CSS selector of the element where the portal will be injected.
   * @returns A promise that resolves when the component has been loaded.
   * @example
   * await PortalView.render('#portalScreen');
   */
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/portal.html");
  }
}
