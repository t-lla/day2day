import { loadSection } from '../router.js';
import { loadComponent } from './loader.js';

let treeItems: HTMLLIElement[] = [];
let selectedIndex = -1;
let currentSection: string | null = null;


export async function initSidebar(): Promise<void> {
  await loadComponent("#sidebar", "../../components/sidebar.html");

  const treeSide = document.getElementById("treeSide");
  if (!treeSide) {
    console.error("Sidebar container (#treeSide) not found.");
    return;
  }
  treeItems = Array.from(treeSide.querySelectorAll("li")) as HTMLLIElement[];

  highlightSelection(selectedIndex);

  treeItems.forEach((item, index) => {

    item.addEventListener("click", () => {
      toggleSectionAt(index);
    });
  })
};

function toggleSectionAt(index: number): void {
  const item = treeItems[index];
  const section = item?.dataset.section;
  if (!section) return;

  if (currentSection === section) {

    const content = document.getElementById("content")!;
    content.innerHTML = "";
    content.classList.add("hidden");
    currentSection = null;
    highlightSelection(-1); //un-highlight
  } else {

    highlightSelection(index); //highlight
    loadSection(section);
    currentSection = section;
  }
}

function highlightSelection(index: number): void {
  treeItems.forEach((item, i) => {
    item.classList.toggle("selected", i === index);
  });
  selectedIndex = index;
}

export function nextSidebarItem(): void {
  if (treeItems.length === 0) return;
  selectedIndex = (selectedIndex + 1) % treeItems.length;
  highlightSelection(selectedIndex);
}

export function prevSidebarItem(): void {
  if (treeItems.length === 0) return;
  selectedIndex = (selectedIndex - 1 + treeItems.length) % treeItems.length;
  highlightSelection(selectedIndex);
}

export function activateSidebarItem(): void {
  if (treeItems.length === 0) return;
  toggleSectionAt(selectedIndex);
}
