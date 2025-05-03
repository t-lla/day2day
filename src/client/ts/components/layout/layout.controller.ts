/**
 * @packageDocumentation
 * @module LayoutController
 *
 * Controller responsible for initializing the application layout view.
 */
import { LayoutView } from "./layout.view.js";

/**
 * LayoutController initializes the main layout of the application by
 * delegating rendering to the LayoutView.
 */
export class LayoutController {
  /**
   * Renders the layout into the specified DOM element.
   *
   * @param selector - CSS selector of the element where the layout will be injected.
   * @returns A promise that resolves when the layout has been rendered.
   * @example
   * await LayoutController.init('#app-root');
   */
  static async init(selector: string): Promise<void> {
    await LayoutView.render(selector);
  }
}
