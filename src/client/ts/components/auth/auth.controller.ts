/**
 * @packageDocumentation
 * @module AuthController
 *
 * Enhanced authentication controller that integrates with the backend API
 * while maintaining compatibility with the existing entry system.
 */

import { loadSection, navigateToApp } from "../../router.js"
import { apiService } from "../../services/api.service.js"
import { storageService } from "../../services/storage.service.js"
import { syncService } from "../../services/sync.service.js"

export class AuthController {
  private container: HTMLElement | null = null

  async init(selector: string): Promise<void> {
    this.container = document.querySelector(selector)
    if (!this.container) return

    await this.renderAuthModal()
    this.setupEventListeners()
  }

  private async renderAuthModal(): Promise<void> {
    if (!this.container) return

    this.container.innerHTML = `
      <div id="auth-overlay" class="overlay hidden"></div>
      <div id="auth-modal" class="modal hidden">
        <div class="modal-window terminal-modal">
          <div class="terminal-navbar">
            <div class="terminal-title">day2day.exe authentication</div>
            <button id="close-auth" class="terminal-close">×</button>
          </div>
          
          <div class="terminal-content">
            <div class="terminal-sidebar">
              <ul class="terminal-tree">
                <li data-form="login" class="selected">├── Login</li>
                <li data-form="register">├── Register</li>
                <li data-form="offline">└── Offline</li>
              </ul>
            </div>
            
            <div class="terminal-main">
              <div id="login-form-container" class="terminal-form-container">
                <h3>> login to sync</h3>
                <form id="login-form" class="terminal-form">
                  <div class="form-group">
                    <label for="login-username">username:</label>
                    <input type="text" id="login-username" name="username" required>
                  </div>
                  <div class="form-group">
                    <label for="login-password">password:</label>
                    <input type="password" id="login-password" name="password" required>
                  </div>
                  <div id="login-error" class="error-message"></div>
                  <button type="submit" class="terminal-button">login</button>
                </form>
              </div>

              <div id="register-form-container" class="terminal-form-container hidden">
                <h3>> create account</h3>
                <form id="register-form" class="terminal-form">
                  <div class="form-group">
                    <label for="register-username">username:</label>
                    <input type="text" id="register-username" name="username" required>
                  </div>
                  <div class="form-group">
                    <label for="register-email">email (optional):</label>
                    <input type="email" id="register-email" name="email">
                  </div>
                  <div class="form-group">
                    <label for="register-password">password:</label>
                    <input type="password" id="register-password" name="password" required>
                  </div>
                  <div class="form-group">
                    <label for="register-confirm">confirm password:</label>
                    <input type="password" id="register-confirm" name="confirmPassword" required>
                  </div>
                  <div id="register-error" class="error-message"></div>
                  <button type="submit" class="terminal-button">register</button>
                </form>
              </div>

              <div id="offline-form-container" class="terminal-form-container hidden">
                <h3>> offline mode</h3>
                <p>Continue using day2day.exe without cloud sync.</p>
                <p>Your data will be stored locally and you can sync later.</p>
                <button id="continue-offline" class="terminal-button">continue offline</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  private setupEventListeners(): void {
    const overlay = document.getElementById("auth-overlay")
    const modal = document.getElementById("auth-modal")
    const closeBtn = document.getElementById("close-auth")
    const loginForm = document.getElementById("login-form") as HTMLFormElement
    const registerForm = document.getElementById("register-form") as HTMLFormElement
    const continueOfflineBtn = document.getElementById("continue-offline")

    overlay?.addEventListener("click", () => this.hideModal())
    closeBtn?.addEventListener("click", () => this.hideModal())

    const sidebarItems = document.querySelectorAll(".terminal-tree li")
    sidebarItems.forEach((item) => {
      item.addEventListener("click", () => {
        const formType = item.getAttribute("data-form")
        if (formType) {
          this.switchForm(formType)
        }
      })
    })

    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault()
      await this.handleLogin(e)
    })

    registerForm?.addEventListener("submit", async (e) => {
      e.preventDefault()
      await this.handleRegister(e)
    })

    continueOfflineBtn?.addEventListener("click", () => {
      this.continueOffline()
    })
  }

  private switchForm(formType: string): void {
    const sidebarItems = document.querySelectorAll(".terminal-tree li")
    sidebarItems.forEach((item) => item.classList.remove("selected"))

    const selectedItem = document.querySelector(`[data-form="${formType}"]`)
    selectedItem?.classList.add("selected")

    const containers = document.querySelectorAll(".terminal-form-container")
    containers.forEach((container) => container.classList.add("hidden"))

    const targetContainer = document.getElementById(`${formType}-form-container`)
    targetContainer?.classList.remove("hidden")
  }

  private async handleLogin(e: Event): Promise<void> {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const errorEl = document.getElementById("login-error")

    if (errorEl) errorEl.textContent = ""

    try {
      const response = await apiService.login(username, password)

      if (response.error) {
        if (errorEl) errorEl.textContent = response.error
        return
      }

      if (response.data?.token && response.data.user) {
        localStorage.removeItem("offline_mode");
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("current_user_id", response.data.user.id);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        storageService.clearNamespace();

        await syncService.forceSync();
        await syncService.initialLoad();

        this.hideModal();
        navigateToApp();
        await loadSection("tasks");
      }
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = "Login failed. Please try again."
      }
    }
  }

  private async handleRegister(e: Event): Promise<void> {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const errorEl = document.getElementById("register-error")

    if (errorEl) errorEl.textContent = ""

    if (password !== confirmPassword) {
      if (errorEl) errorEl.textContent = "Passwords do not match"
      return
    }

    try {
      const response = await apiService.register(username, password, email)

      if (response.error) {
        if (errorEl) errorEl.textContent = response.error
        return
      }

      if (response.data?.token && response.data.user) {
        localStorage.removeItem("offline_mode");
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("current_user_id", response.data.user.id);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        storageService.clearNamespace();

        await syncService.forceSync();
        await syncService.initialLoad();

        this.hideModal();
        navigateToApp();
        await loadSection("tasks");
      }
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = "Registration failed. Please try again."
      }
    }
  }

  private continueOffline(): void {
    const guestUser = {
      id: "offline",
      username: "Guest User",
      email: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem("current_user_id", guestUser.id);
    storageService.clearNamespace();
    localStorage.setItem("user", JSON.stringify(guestUser))
    localStorage.setItem("offline_mode", "true")
    this.hideModal()
    window.location.reload()
  }

  showModal(): void {
    const overlay = document.getElementById("auth-overlay")
    const modal = document.getElementById("auth-modal")

    overlay?.classList.remove("hidden")
    modal?.classList.remove("hidden")

    setTimeout(() => {
      const usernameInput = document.getElementById("login-username") as HTMLInputElement
      usernameInput?.focus()
    }, 100)
  }

  hideModal(): void {
    const overlay = document.getElementById("auth-overlay")
    const modal = document.getElementById("auth-modal")

    overlay?.classList.add("hidden")
    modal?.classList.add("hidden")
  }
}

export const authController = new AuthController()
