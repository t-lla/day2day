/**
 * @packageDocumentation
 * @module Loader
 *
 * Provides utility to fetch and inject HTML components into the DOM.
 */

/**
 * Fetches an HTML file from the given URL and loads its content into the
 * specified DOM container element.
 * Simplifies dynamic loading of components for rendering UI elements.
 *
 * @param selector - CSS selector of the container element where the HTML will be injected.
 * @param url - URL path to the HTML file to fetch and inject.
 * @returns A promise that resolves when the component is loaded or rejects on errors.
 * @throws Will throw an error if the selector is invalid or the HTML file cannot be fetched.
 * @example
 * await loadComponent('#app-root', '../../components/layout.html');
 */
export async function loadComponent( selector: string,  url: string ): Promise<void> {
  const container = document.querySelector(selector);

  if (!container) {
    console.error(`Selector not found: ${selector}`);
    return;
  }
  try {
    console.log(`Fetching ${url} for ${selector}`);
    const response = await fetch(url);

    if (response.ok) {
      container.innerHTML = await response.text();
      console.log(`Loaded ${url} into ${selector}`);
    } else {
      console.error(`Error loading ${url}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
  }

}
