/**
 * @packageDocumentation
 * @module Router
 *
 * Provides navigation logic for displaying sections of the application,
 * handling portal visibility and formatting dates.
 */
import { initNotes } from "./components/notes/notes.controller.js"
import { initTasks } from "./components/tasks/tasks.controller.js"
import { initHabits } from "./components/habits/habits.controller.js"
import { setPortalVisible } from "./components/sidebar/sidebar.controller.js"
import { initFinances } from "./components/finances/finances.controller.js"
import { initSectionSelector } from "./components/section-selector/section-selector.controller.js"
import { renderMiniHeader, hideMiniHeader } from "./components/mini-header.js"
import { initFolders } from "./components/folders/folders.controller.js"
import { initProfile } from "./components/profile/profile.controller.js"

let portalVisible = true
let currentSection: string | null = null

/**
 * Displays the main menu by showing the portal screen and hiding any other content.
 * Resets portal visibility state to the intro screen.
 */
export function showMainMenu(): void {
  const portal = document.getElementById("portalScreen")
  const content = document.getElementById("content")
  const miniHeader = document.getElementById("miniHeader")

  if (portal) {
    portal.classList.remove("hidden")
  }
  if (content) {
    content.classList.add("hidden")
    content.innerHTML = ""
  }
  if (miniHeader) {
    miniHeader.classList.add("hidden")
  }

  portalVisible = true
  currentSection = null
  setPortalVisible(true)
}

/**
 * Hides the portal screen and shows content. If content is empty, displays the section selector.
 * Updates portal visibility state.
 */
export function navigateToApp(): void {
  const portal = document.getElementById("portalScreen")
  const content = document.getElementById("content")

  if (portal) {
    portal.classList.add("hidden")
  }
  if (content) {
    content.classList.remove("hidden")
    if (!content.innerHTML.trim()) {
      initSectionSelector()
    }
  }

  portalVisible = false
  setPortalVisible(false)
}

/**
 * Initializes the router and sets up event listeners.
 */
export function initRouter(): void {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains("skip-intro")) {
      navigateToApp()
    }
  })
}

/**
 * Loads sections by name.
 * If the section is already active, it will show the section selector instead.
 *
 * @param section Identifier of the section to load.
 * @throws Will throw an error if the content element is not found.
 * @example
 * loadSection('tasks');
 */
export function loadSection(section: string): void {
  const content = document.getElementById("content")
  const portal = document.getElementById("portalScreen")

  if (!content) throw new Error("Content container not found")

  if (portal && !portal.classList.contains("hidden")) {
    portal.classList.add("hidden")
    portalVisible = false
    setPortalVisible(false)
  }

  if (section === currentSection) {
    currentSection = null
    hideMiniHeader()
    initSectionSelector()
    return
  }

  currentSection = section

  renderMiniHeader(section)

  switch (section) {
    case "notes":
      initNotes()
      break
    case "tasks":
      initTasks()
      break
    case "habits":
      initHabits()
      break
    case "finances":
      initFinances()
      break
    case "folders":
      initFolders()
      break
    case "profile":
      initProfile()
      break
    default:
      initSectionSelector()
  }

  content.classList.remove("hidden")
}

/**
 * Formats a Date object into a DD/MM/YYYY string.
 *
 * @param date - The Date object to format.
 * @returns A formatted date string in DD/MM/YYYY format.
 * @example
 * const date = new Date('2025-05-03');
 * console.log(formatDate(date)); // '03/05/2025'
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}
