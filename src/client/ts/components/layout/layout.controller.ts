import { LayoutView } from "./layout.view.js";

export class LayoutController {
  static async init(selector: string): Promise<void> {
    await LayoutView.render(selector);
  }
}