/**
 * @packageDocumentation
 * @module MiniHeader
 *
 * Provides a smaller header to display when a section is active.
 */

/**
 * Renders a smaller version of the day2day.exe ASCII art header.
 *
 * @param section The name of the currently active section
 */
export function renderMiniHeader(section: string): void {
  const miniHeader = document.getElementById("miniHeader")
  if (!miniHeader) return

  const asciiArt = `
     █████                       ████████      █████                                                      
    ░░███                       ███░░░░███    ░░███                                                       
  ███████   ██████   █████ ████░░░    ░███  ███████   ██████   █████ ████     ██████  █████ █████  ██████ 
 ███░░███  ░░░░░███ ░░███ ░███    ███████  ███░░███  ░░░░░███ ░░███ ░███     ███░░███░░███ ░░███  ███░░███
░███ ░███   ███████  ░███ ░███   ███░░░░  ░███ ░███   ███████  ░███ ░███    ░███████  ░░░█████░  ░███████ 
░███ ░███  ███░░███  ░███ ░███  ███      █░███ ░███  ███░░███  ░███ ░███    ░███░░░    ███░░░███ ░███░░░  
░░████████░░████████ ░░███████ ░██████████░░████████░░████████ ░░███████  ██░░██████  █████ █████░░██████ 
 ░░░░░░░░  ░░░░░░░░   ░░░░░███ ░░░░░░░░░░  ░░░░░░░░  ░░░░░░░░   ░░░░░███ ░░  ░░░░░░  ░░░░░ ░░░░░  ░░░░░░  
                      ███ ░███                                  ███ ░███                                  
                     ░░██████                                  ░░██████                                   
                      ░░░░░░                                    ░░░░░░                                    
  `

  miniHeader.innerHTML = `
    <div class="mini-header">
      <pre class="mini-ascii">${asciiArt}</pre>
    </div>
  `

  miniHeader.classList.remove("hidden")
}

/**
 * Hides the mini header.
 */
export function hideMiniHeader(): void {
  const miniHeader = document.getElementById("miniHeader")
  if (miniHeader) {
    miniHeader.classList.add("hidden")
  }
}
