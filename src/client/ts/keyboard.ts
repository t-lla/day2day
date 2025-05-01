import { nextSidebarItem, prevSidebarItem, activateSidebarItem } from "./components/sidebar/sidebar.controller.js";
  
  export function initGlobalKeyboardNavigation(): void {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement)
      ) {
        return;
      }
  
      switch (e.key) {
        case "ArrowDown":
          nextSidebarItem();
          e.preventDefault();
          break;
        case "ArrowUp":
          prevSidebarItem();
          e.preventDefault();
          break;
        case "Enter":
          activateSidebarItem();
          e.preventDefault();
          break;
        default:
          break;
      }
    });
  }