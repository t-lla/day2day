import { NavbarView } from "./navbar.view.js";
import { NavbarModel } from "./navbar.model.js";
import { showMainMenu } from "../../router.js";
import { showEntryModal } from "../entry/entry.controller.js";

export class NavbarController {
  private model: NavbarModel;

  constructor() {
    this.model = new NavbarModel();
  }

  async init(selector: string): Promise<void> {
    await NavbarView.render(selector);

    const logo = document.querySelector<HTMLElement>(".logo");
    const entry = document.querySelector<HTMLElement>(".entry");

    this.updateNavbar();

    if (logo) {
      logo.addEventListener("click", showMainMenu);
    }

    if (entry) {
      entry.addEventListener("click", () => {
        if (this.model.isLoggedIn()) {
          this.model.removeUser();
          window.location.reload();
        } else {
          showEntryModal();
        }
      });
    }
  }

  updateNavbar(): void {
    const isLoggedIn = this.model.isLoggedIn();
    const user = this.model.getUser();

    NavbarView.setUserInfo(isLoggedIn && user ? user.username : null);
    NavbarView.setEntryText(isLoggedIn ? "> logout" : "> entry");
  }
}