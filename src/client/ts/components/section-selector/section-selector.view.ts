/**
 * @packageDocumentation
 * @module SectionSelector
 *
 * Provides a section selection screen with descriptions of each section.
 */

/**
 * Renders the section selector screen with descriptions of available sections.
 */
export function renderSectionSelector(): void {
  const content = document.getElementById("content")
  if (!content) return

  content.innerHTML = `
    <div class="section-selector">
      <h2>> Select a section</h2>
      
      <div class="section-grid">
        <div class="section-card" data-section="notes">
          <h3>> Notes</h3>
          <p>Create and manage your personal notes and thoughts.</p>
        </div>
        
        <div class="section-card" data-section="tasks">
          <h3>> Tasks</h3>
          <p>Track your to-do items and manage your daily tasks.</p>
        </div>
        
        <div class="section-card" data-section="habits">
          <h3>> Habits</h3>
          <p>Build and maintain positive habits with streak tracking.</p>
        </div>
        
        <div class="section-card" data-section="finances">
          <h3>> Finances</h3>
          <p>Monitor your expenses and manage your financial records.</p>
        </div>
      </div>
    </div>
  `

  const sectionCards = document.querySelectorAll(".section-card")
  sectionCards.forEach((card) => {
    card.addEventListener("click", () => {
      const section = card.getAttribute("data-section")
      if (section) {
        const event = new CustomEvent("section-selected", {
          detail: { section },
        })
        document.dispatchEvent(event)
      }
    })
  })
}
