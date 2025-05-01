import { loadComponent } from "../loader.js";

export class SidebarView {
    static async render(selector: string): Promise<void> {
      return loadComponent(selector, "../../components/sidebar.html");
    }
  
    static highlightSelection(index: number, treeItems: HTMLLIElement[]): void {
      treeItems.forEach((item, i) => {
        item.classList.toggle("selected", i === index);
      });
    }
  }