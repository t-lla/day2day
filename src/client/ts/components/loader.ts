export async function loadComponent(selector: string, url: string): Promise<void> {
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
