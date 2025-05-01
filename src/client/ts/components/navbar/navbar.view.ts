import { loadComponent } from "../loader.js";

export class NavbarView {
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/navbar.html");
  }

  static setEntryText(text: string): void {
    const entry = document.querySelector<HTMLElement>(".entry");
    if (entry) {
      entry.textContent = text;
    }
  }

  static setUserInfo(username: string | null): void {
    const userInfo = document.querySelector<HTMLElement>(".user-info");
    if (userInfo) {
      userInfo.textContent = username || "";
    }
  }
}