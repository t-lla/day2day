import { loadComponent } from "../loader.js";

export class EntryView {
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/entry.html");
  }

  static hideModal(): void {
    const overlay = document.getElementById("entry-overlay") as HTMLDivElement;
    const modal = document.getElementById("entry-modal") as HTMLDivElement;

    overlay?.classList.add("hidden");
    modal?.classList.add("hidden");
  }

  static showModal(): void {
    const overlay = document.getElementById("entry-overlay") as HTMLDivElement;
    const modal = document.getElementById("entry-modal") as HTMLDivElement;

    overlay?.classList.remove("hidden");
    modal?.classList.remove("hidden");
  }

  static setSelectedForm(formType: "login" | "signup"): void {
    const sidebarItems = document.querySelectorAll(
      ".terminal-tree li"
    ) as NodeListOf<HTMLElement>;
    sidebarItems.forEach((i) => i.classList.remove("selected"));

    sidebarItems.forEach((item) => {
      if (item.getAttribute("data-form") === formType) {
        item.classList.add("selected");
      }
    });

    const loginFormContainer = document.getElementById(
      "login-form-container"
    ) as HTMLDivElement;
    const signupFormContainer = document.getElementById(
      "signup-form-container"
    ) as HTMLDivElement;

    if (formType === "login") {
      loginFormContainer?.classList.remove("hidden");
      signupFormContainer?.classList.add("hidden");
    } else {
      loginFormContainer?.classList.add("hidden");
      signupFormContainer?.classList.remove("hidden");
    }
  }
}