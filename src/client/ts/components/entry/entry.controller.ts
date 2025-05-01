import { EntryView } from "./entry.view.js";
import { EntryModel } from "./entry.model.js";

let entryController: EntryController | null = null;

export class EntryController {
  private model: EntryModel;

  constructor() {
    this.model = new EntryModel();
  }

  async init(selector: string): Promise<void> {
    await EntryView.render(selector);

    const overlay = document.getElementById("entry-overlay") as HTMLDivElement;
    const closeBtn = document.getElementById("close-entry") as HTMLElement;
    const loginForm = document.getElementById("login-form") as HTMLFormElement;
    const signupForm = document.getElementById("signup-form") as HTMLFormElement;

    overlay?.addEventListener("click", this.hideEntryModal);
    closeBtn?.addEventListener("click", this.hideEntryModal);

    const sidebarItems = document.querySelectorAll(
      ".terminal-tree li"
    ) as NodeListOf<HTMLElement>;
    sidebarItems.forEach((item) => {
      item.addEventListener("click", () => {
        const formType = item.getAttribute("data-form") as "login" | "signup";
        EntryView.setSelectedForm(formType);
      });
    });

    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = (
        document.getElementById("username") as HTMLInputElement
      ).value;
      const password = (
        document.getElementById("password") as HTMLInputElement
      ).value;

      console.log(`Login attempt: ${username}`);

      this.model.setUser({ username, name: username });
      this.hideEntryModal();

      window.location.reload();
    });

    signupForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = (
        document.getElementById("newUsername") as HTMLInputElement
      ).value;
      const password = (
        document.getElementById("newPassword") as HTMLInputElement
      ).value;
      const confirmPassword = (
        document.getElementById("confirmPassword") as HTMLInputElement
      ).value;

      if (password !== confirmPassword) {
        const errorElement = document.getElementById("signup-error");
        if (errorElement) {
          errorElement.textContent = "Passwords do not match";
        }
        return;
      }

      console.log(`Register attempt: ${username}`);

      this.model.setUser({ username, name: username });
      this.hideEntryModal();

      window.location.reload();
    });
  }

  showEntryModal(): void {
    EntryView.showModal();
    EntryView.setSelectedForm("login");

    setTimeout(() => {
      (document.getElementById("username") as HTMLInputElement)?.focus();
    }, 100);
  }

  hideEntryModal(): void {
    EntryView.hideModal();
  }

  async ensureShow(): Promise<void> {
    if (!entryController) {
      entryController = new EntryController();
    }
    if (
      !document.getElementById("entry-overlay") || !document.getElementById("entry-modal")
    ) {
      await entryController.init("#entry-container");
    }
    this.showEntryModal();
  }
}

export function initEntry(): Promise<void> {
  if (!entryController) {
    entryController = new EntryController();
  }
  return entryController.init("#entry-container");
}

export function showEntryModal(): Promise<void> {
  if (!entryController) entryController = new EntryController();
  return entryController.ensureShow();
}