export function showMainMenu(): void { //click on logo, back to main layout
  const portal = document.getElementById("portalScreen");
  const content = document.getElementById("content");
  if (portal) {
    portal.classList.remove("hidden");
  }
  if (content) {
    content.classList.add("hidden");
    content.innerHTML = '';
  }
}

export function navigateToApp(): void { //skip to content(hides portal)
  const portal = document.getElementById("portalScreen");
  const content = document.getElementById("content");
  if (portal) {
    portal.classList.add("hidden");
  }
  if (content) {
    content.classList.remove("hidden");
    if (!content.innerHTML.trim()) {
      content.innerHTML = `<p>> now what? </p>`;
    }
  }
}

export function initRouter(): void {

}