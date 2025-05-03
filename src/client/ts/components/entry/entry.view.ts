/**
 * @packageDocumentation
 * @module EntryView
 *
 * Renders entry modal (login/signup).
 * Loads HTML, toggles visibility and switches between login and signup forms.
 */
import { loadComponent } from "../loader.js";

/**
 * EntryView offers static functions to manage the entry component;
 * loading the HTML template and toggling modal visibility.
 */
export class EntryView {
  /**
   * Renders the entry HTML component into the specified container.
   * Uses the loadComponent utility to fetch and inject the modal template.
   *
   * @param selector - CSS selector of the element where the component will be injected.
   * @returns A promise that resolves when the component has been loaded.
   */
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/entry.html");
  }

  /** Hides the entry modal by adding the "hidden" class to the overlay and modal elements. */
  static hideModal(): void {
    const overlay = document.getElementById("entry-overlay") as HTMLDivElement;
    const modal = document.getElementById("entry-modal") as HTMLDivElement;

    overlay?.classList.add("hidden");
    modal?.classList.add("hidden");
  }

  /** Shows the entry modal by removing the "hidden" class from the overlay and moda lelements. */
  static showModal(): void {
    const overlay = document.getElementById("entry-overlay") as HTMLDivElement;
    const modal = document.getElementById("entry-modal") as HTMLDivElement;

    overlay?.classList.remove("hidden");
    modal?.classList.remove("hidden");
  }

  /**
   * Switches the active form (login or signup) in 
   * the modal sidebar and toggles form visibility.
   *
   * @param formType - The type of form to display: "login" or "signup".
   * @example
   * EntryView.setSelectedForm('signup');
   */
  static setSelectedForm(formType: "login" | "signup"): void {
    const sidebarItems = document.querySelectorAll( ".terminal-tree li" ) as NodeListOf<HTMLElement>;
    sidebarItems.forEach((i) => i.classList.remove("selected"));

    sidebarItems.forEach((item) => {
      if (item.getAttribute("data-form") === formType) {
        item.classList.add("selected");
      }
    });

    const loginFormContainer = document.getElementById( "login-form-container" ) as HTMLDivElement;
    const signupFormContainer = document.getElementById( "signup-form-container" ) as HTMLDivElement;

    if (formType === "login") {
      loginFormContainer?.classList.remove("hidden");
      signupFormContainer?.classList.add("hidden");
    } else {
      loginFormContainer?.classList.add("hidden");
      signupFormContainer?.classList.remove("hidden");
    }
  }
}
