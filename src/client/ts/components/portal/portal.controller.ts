import { PortalView } from "./portal.view.js";
import { navigateToApp } from "../../router.js";

export class PortalController {
  async init(selector: string): Promise<void> {
    await PortalView.render(selector);

    const skipLink = document.querySelector(".skip-intro");
    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToApp();
      });
    }
  }
}