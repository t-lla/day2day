import { loadComponent } from  "../loader.js";

export class PortalView {
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/portal.html");
  }
}