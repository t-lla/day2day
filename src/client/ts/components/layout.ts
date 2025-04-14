import { loadComponent } from './loader.js';

export async function loadLayout(): Promise<void> {
  await loadComponent("#app-root", "../../components/layout.html");
}