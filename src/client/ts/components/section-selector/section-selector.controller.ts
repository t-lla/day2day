/**
 * @packageDocumentation
 * @module SectionSelector
 *
 * Controller for the section selector component.
 */

import { renderSectionSelector } from "./section-selector.view.js"
import { loadSection } from "../../router.js"

/**
 * Initializes the section selector component.
 */
export function initSectionSelector(): void {
  renderSectionSelector()

  document.addEventListener("section-selected", (e: Event) => {
    const customEvent = e as CustomEvent
    const section = customEvent.detail.section
    if (section) {
      loadSection(section)
    }
  })
}
