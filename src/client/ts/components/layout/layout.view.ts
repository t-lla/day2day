import { loadComponent } from "../loader.js";

export class LayoutView {
  static render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/layout.html");
  }
}