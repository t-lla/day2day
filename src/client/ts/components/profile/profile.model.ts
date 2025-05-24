/**
 * @packageDocumentation
 * @module ProfileModel
 *
 * Model responsible for managing user profile data and theme settings.
 */

/**
 * ProfileModel provides methods to retrieve and persist user data
 * and theme preferences in localStorage.
 */
export class ProfileModel {
  /**
   * Retrieves the stored user object from localStorage.
   *
   * @returns The parsed user object if present; otherwise, null.
   */
  getUser(): any {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }

  /**
   * Stores the given user object in localStorage under the key "user".
   *
   * @param user - The user data object to store.
   */
  setUser(user: any): void {
    localStorage.setItem("user", JSON.stringify(user))
  }

  /**
   * Gets the current theme setting from localStorage.
   * Defaults to "dark" if no theme is set.
   *
   * @returns The current theme: "dark" or "light".
   */
  getTheme(): "dark" | "light" {
    const theme = localStorage.getItem("theme")
    return (theme as "dark" | "light") || "dark"
  }

  /**
   * Saves the theme setting to localStorage.
   *
   * @param theme - The theme to save: "dark" or "light".
   */
  setTheme(theme: "dark" | "light"): void {
    localStorage.setItem("theme", theme)
  }
}
