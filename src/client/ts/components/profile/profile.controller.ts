/**
 * @packageDocumentation
 * @module ProfileController
 *
 * Controller responsible for managing the profile section:
 * displaying user info, changing username, switching themes,
 * and showing progress statistics across different sections.
 */
import { ProfileView } from "./profile.view.js"
import { ProfileModel } from "./profile.model.js"
import { loadComponent } from "../loader.js"
import { formatDate } from "../../router.js"

import * as habitsModel from "../habits/habits.model.js"
import { financesModel } from "../finances/finances.model.js"

/**
 * Controls profile-related functionality and UI updates.
 */
export class ProfileController {
  private model: ProfileModel
  private container: HTMLElement

  /**
   * Creates a new instance of ProfileController with its data model.
   * @param container - The container element
   */
  constructor(container: HTMLElement) {
    this.model = new ProfileModel()
    this.container = container
  }

  /**
   * Initializes the profile view, loads data, and binds UI event listeners.
   */
  async init(): Promise<void> {
    await this.renderProfile()
    this.setupEventListeners()
    this.loadUserInfo()
    this.loadThemeSettings()
    this.loadProgressStats()
  }

  /**
   * Renders the profile component into the container
   */
  private async renderProfile(): Promise<void> {
    await loadComponent("#content", "components/profile.html")
  }

  /**
   * Sets up event listeners for the profile component
   */
  private setupEventListeners(): void {
    const editUsernameBtn = document.getElementById("editUsernameBtn")
    editUsernameBtn?.addEventListener("click", () => {
      this.showUsernameForm()
    })

    const usernameForm = document.getElementById("usernameForm") as HTMLFormElement
    usernameForm?.addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveUsername()
    })

    const cancelUsernameBtn = document.getElementById("cancelUsernameBtn")
    cancelUsernameBtn?.addEventListener("click", () => {
      this.hideUsernameForm()
    })

    const themeRadios = document.querySelectorAll('input[name="theme"]')
    themeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement
        if (target.checked) {
          this.changeTheme(target.value as "dark" | "light")
        }
      })
    })
  }

  /**
   * Loads and displays user information
   */
  private loadUserInfo(): void {
    const user = this.model.getUser()

    if (user) {
      const profileUsername = document.getElementById("profileUsername")
      if (profileUsername) {
        profileUsername.textContent = user.username || "Anonymous"
      }

      const profileEmail = document.getElementById("profileEmail")
      if (profileEmail) {
        profileEmail.textContent = user.email || "user@day2day.exe"
      }

      const avatarInitial = document.getElementById("avatarInitial")
      if (avatarInitial) {
        avatarInitial.textContent = (user.username ? user.username[0] : "A").toUpperCase()
      }

      const profileJoined = document.getElementById("profileJoined")
      if (profileJoined) {
        const joinDate = user.joinDate ? new Date(user.joinDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        profileJoined.textContent = formatDate(joinDate)
      }
    }
  }

  /**
   * Loads and applies theme settings
   */
  private loadThemeSettings(): void {
    const currentTheme = this.model.getTheme()

    const themeRadio = document.getElementById(
      `theme${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`,
    ) as HTMLInputElement
    if (themeRadio) {
      themeRadio.checked = true
    }

    this.applyTheme(currentTheme)
  }

  /**
   * Loads and displays progress statistics from different sections
   */
  private loadProgressStats(): void {
    const habits = habitsModel.getAllHabits()
    const todayStr = new Date().toISOString().split("T")[0]
    const completedHabits = habits.filter((h) => h.completedDates.some((d) => d.startsWith(todayStr))).length
    const habitsRate = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0

    const habitsTotal = document.getElementById("habitsTotal")
    const habitsCompleted = document.getElementById("habitsCompleted")
    const habitsRateEl = document.getElementById("habitsRate")
    const habitsProgressBar = document.getElementById("habitsProgressBar")

    if (habitsTotal) habitsTotal.textContent = habits.length.toString()
    if (habitsCompleted) habitsCompleted.textContent = completedHabits.toString()
    if (habitsRateEl) habitsRateEl.textContent = `${habitsRate}%`
    if (habitsProgressBar) habitsProgressBar.style.width = `${habitsRate}%`

    const tasksData = localStorage.getItem("tasks")
    const tasks = tasksData ? JSON.parse(tasksData) : []
    const completedTasks = tasks.filter((t: any) => t.completed).length
    const tasksRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

    const tasksTotal = document.getElementById("tasksTotal")
    const tasksCompletedEl = document.getElementById("tasksCompleted")
    const tasksRateEl = document.getElementById("tasksRate")
    const tasksProgressBar = document.getElementById("tasksProgressBar")

    if (tasksTotal) tasksTotal.textContent = tasks.length.toString()
    if (tasksCompletedEl) tasksCompletedEl.textContent = completedTasks.toString()
    if (tasksRateEl) tasksRateEl.textContent = `${tasksRate}%`
    if (tasksProgressBar) tasksProgressBar.style.width = `${tasksRate}%`

    const notesData = localStorage.getItem("notes")
    const notes = notesData ? JSON.parse(notesData) : []
    const notesWithTags = notes.filter((n: any) => n.tags && n.tags.length > 0).length

    const notesTotal = document.getElementById("notesTotal")
    const notesWithTagsEl = document.getElementById("notesWithTags")

    if (notesTotal) notesTotal.textContent = notes.length.toString()
    if (notesWithTagsEl) notesWithTagsEl.textContent = notesWithTags.toString()

    const accounts = financesModel.getAccounts()
    const transactions = financesModel.getAllTransactions()
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const summary = financesModel.getMonthlySummary(currentMonth, currentYear)

    const financesAccounts = document.getElementById("financesAccounts")
    const financesTransactions = document.getElementById("financesTransactions")
    const financesBalance = document.getElementById("financesBalance")

    if (financesAccounts) financesAccounts.textContent = accounts.length.toString()
    if (financesTransactions) financesTransactions.textContent = transactions.length.toString()
    if (financesBalance) {
      financesBalance.textContent = `$${summary.savedAmount.toFixed(2)}`
      financesBalance.className = summary.savedAmount >= 0 ? "stat-value positive" : "stat-value negative"
    }
  }

  /**
   * Shows the username change form
   */
  private showUsernameForm(): void {
    const user = this.model.getUser()
    const newUsernameInput = document.getElementById("newUsername") as HTMLInputElement

    if (user && newUsernameInput) {
      newUsernameInput.value = user.username || ""
    }

    ProfileView.toggleVisibility("usernameFormContainer", true)
  }

  /**
   * Hides the username change form
   */
  private hideUsernameForm(): void {
    ProfileView.toggleVisibility("usernameFormContainer", false)
  }

  /**
   * Saves the new username
   */
  private saveUsername(): void {
    const newUsernameInput = document.getElementById("newUsername") as HTMLInputElement
    if (!newUsernameInput || !newUsernameInput.value.trim()) return

    const user = this.model.getUser() || {}
    user.username = newUsernameInput.value.trim()

    this.model.setUser(user)
    this.loadUserInfo()
    this.hideUsernameForm()

    const userInfo = document.querySelector(".user-info")
    if (userInfo) {
      userInfo.textContent = user.username
    }
  }

  /**
   * Changes the theme
   * @param theme - The theme to apply: "dark" or "light"
   */
  private changeTheme(theme: "dark" | "light"): void {
    this.model.setTheme(theme)
    this.applyTheme(theme)
  }

  /**
   * Applies the theme to the document
   * @param theme - The theme to apply: "dark" or "light"
   */
  private applyTheme(theme: "dark" | "light"): void {
    const root = document.documentElement

    if (theme === "light") {
      root.style.setProperty("--background-dark", "#f5f5f5")
      root.style.setProperty("--background-light", "#ffffff")
      root.style.setProperty("--primary-green", "#2c9b57")
      root.style.setProperty("--hover-green", "#40e07d")
      root.style.setProperty("--border-color", "rgba(44, 155, 87, 0.3)")
      document.body.style.color = "#2c9b57"
    } else {
      root.style.setProperty("--background-dark", "#0d0d0d")
      root.style.setProperty("--background-light", "#1a1a1a")
      root.style.setProperty("--primary-green", "rgb(64, 224, 125)")
      root.style.setProperty("--hover-green", "rgb(44, 155, 87)")
      root.style.setProperty("--border-color", "rgba(64, 224, 125, 0.3)")
      document.body.style.color = "var(--primary-green)"
    }
  }
}

/**
 * Initializes the profile controller
 */
export function initProfile(): void {
  const container = document.getElementById("content")
  if (!container) {
    throw new Error("Content container not found")
  }

  const controller = new ProfileController(container)
  controller.init()
}
