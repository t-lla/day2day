import { loadSection, navigateToApp } from "../../router.js";
import { SidebarView } from "./sidebar.view.js";

let sidebarController: SidebarController | null = null;

export class SidebarController {
  private treeItems: HTMLLIElement[] = [];
  private selectedIndex = -1;
  private currentSection: string | null = null;
  private portalVisible = true; //track portalScreen visibility

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

  toggleSectionAt(index: number): void {
    const item = this.treeItems[index];
    const section = item?.dataset.section;
    if (!section) return;

    const portal = document.getElementById("portalScreen")!;
    const content = document.getElementById("content")!;

    if (this.currentSection === section) {
      this.currentSection = null;
      this.highlightSelection(-1); //un-highlight
      content.innerHTML = "";
      content.classList.add("hidden");
      if (this.portalVisible) { //if portal never skipped, keep it visible
        portal.classList.remove("hidden");
      } else {
        navigateToApp();
      }
    } else {
      this.highlightSelection(index); //highlight
      loadSection(section);
      this.currentSection = section;
    }
  }

  highlightSelection(index: number): void {
    SidebarView.highlightSelection(index, this.treeItems);
    this.selectedIndex = index;
  }

  nextSidebarItem(): void {
    if (this.treeItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.treeItems.length;
    this.highlightSelection(this.selectedIndex);
  }

  prevSidebarItem(): void {
    if (this.treeItems.length === 0) return;
    this.selectedIndex =
      (this.selectedIndex - 1 + this.treeItems.length) % this.treeItems.length;
    this.highlightSelection(this.selectedIndex);
  }

  activateSidebarItem(): void {
    if (this.treeItems.length === 0) return;
    this.toggleSectionAt(this.selectedIndex);
  }

  setPortalVisible(visible: boolean): void {
    this.portalVisible = visible;
  }
}

export function initSidebar(): Promise<void> {
  if (!sidebarController) {
    sidebarController = new SidebarController();
  }
  return sidebarController.init("#sidebar");
}

export function nextSidebarItem(): void {
  if (!sidebarController) return;
  sidebarController.nextSidebarItem();
}

export function prevSidebarItem(): void {
  if (!sidebarController) return;
  sidebarController.prevSidebarItem();
}

export function activateSidebarItem(): void {
  if (!sidebarController) return;
  sidebarController.activateSidebarItem();
}

export function setPortalVisible(visible: boolean): void {
  if (!sidebarController) return;
  sidebarController.setPortalVisible(visible);
}