/**
 * @packageDocumentation
 * @module SidebarController
 *
 * Controller for the application's sidebar navigation, handling
 * section toggling, keyboard navigation, and portal visibility.
 * Coordinates with the SidebarView for UI updates and the router for loading sections.
 */
import { loadSection, navigateToApp } from "../../router.js";
import { SidebarView } from "./sidebar.view.js";

/** Singleton instance of the SidebarController to maintain navigation state. */
let sidebarController: SidebarController | null = null;

/**
 * Manages the sidebar UI behavior, including selecting and loading sections,
 * highlighting items, and controlling portal view state.
 */
export class SidebarController {
  private treeItems: HTMLLIElement[] = [];
  private selectedIndex = -1;
  private currentSection: string | null = null;
  private portalVisible = true;

  /**
   * Renders the sidebar and sets up click handlers on each tree item.
   *
   * @param selector - CSS selector of the sidebar container element.
   * @returns A promise that resolves when rendering is complete.
   * @throws Will throw an error if the selector is invalid or the HTML file cannot be fetched.
   * @example
   * await controller.init('#sidebar');
   */
  async init(selector: string): Promise<void> {
    await SidebarView.render(selector);

    const treeSide = document.getElementById("treeSide");
    if (!treeSide) {
      console.error("Sidebar container (#treeSide) not found.");
      return;
    }
    this.treeItems = Array.from(
      treeSide.querySelectorAll("li")
    ) as HTMLLIElement[];

    this.treeItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        this.toggleSectionAt(index);
      });
    });
  }

  /**
   * Toggles the visibility of a section at the speciifed index.
   * Loads or unloads content and handles portal fallback or navigation.
   *
   * @param index - Index of the sidebar item to toggle.
   * @example
   * controller.toggleSectionAt(0);
   */
  toggleSectionAt(index: number): void {
    const item = this.treeItems[index];
    const section = item?.dataset.section;
    if (!section) return;

    const portal = document.getElementById("portalScreen")!;
    const content = document.getElementById("content")!;

    if (this.currentSection === section) {
      this.currentSection = null;
      this.highlightSelection(-1);
      content.innerHTML = "";
      content.classList.add("hidden");
      if (this.portalVisible) {
        portal.classList.remove("hidden");
      } else {
        navigateToApp();
      }
    } else {
      this.highlightSelection(index);
      loadSection(section);
      this.currentSection = section;
    }
  }

  /**
   * Highlights the sidebar item at the specified index.
   *
   * @param index - Index of the item to highlight, or -1 to clear selection.
   */
  highlightSelection(index: number): void {
    SidebarView.highlightSelection(index, this.treeItems);
    this.selectedIndex = index;
  }

  /** Moves the selection to the next sidebar item in a cyclic manner. */
  nextSidebarItem(): void {
    if (this.treeItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.treeItems.length;
    this.highlightSelection(this.selectedIndex);
  }

  /** Moves the selection to the previous sidebar item in a cyclic manner. */
  prevSidebarItem(): void {
    if (this.treeItems.length === 0) return;
    this.selectedIndex =
      (this.selectedIndex - 1 + this.treeItems.length) % this.treeItems.length;
    this.highlightSelection(this.selectedIndex);
  }

  /** Activates the currently selected sidebar item, toggling its section. */
  activateSidebarItem(): void {
    if (this.treeItems.length === 0) return;
    this.toggleSectionAt(this.selectedIndex);
  }

  /**
   * Sets whether the portal screen remains visible when toggling sections.
   *
   * @param visible - True to keep portal visible; false to hide permanently after skip.
   */
  setPortalVisible(visible: boolean): void {
    this.portalVisible = visible;
  }
}

/**
 * Initializes the singleton SidebarController and renders it to the container.
 * Creates a singleton instance if none exists and calls its init method.
 *
 * @returns A promise that resolves when initialization is complete.
 */
export function initSidebar(): Promise<void> {
  if (!sidebarController) {
    sidebarController = new SidebarController();
  }
  return sidebarController.init("#sidebar");
}

/** Moves sidebar selection to the next item. */
export function nextSidebarItem(): void {
  sidebarController?.nextSidebarItem();
}

/** Moves sidebar selection to the previous item. */
export function prevSidebarItem(): void {
  sidebarController?.prevSidebarItem();
}

/** Activates the currently selected sidebar item. */
export function activateSidebarItem(): void {
  sidebarController?.activateSidebarItem();
}

/**
 * Configures whether the portal screen remains visible after skipping.
 *
 * @param visible - True to keep portal visible; false to hide permanently.
 * @example
 * setPortalVisible(false);
 */
export function setPortalVisible(visible: boolean): void {
  sidebarController?.setPortalVisible(visible);
}
