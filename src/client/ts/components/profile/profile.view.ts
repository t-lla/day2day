/**
 * @packageDocumentation
 * @module ProfileView
 *
 * Provides methods for rendering and updating the profile UI.
 */

/**
 * ProfileView offers static functions to manage the DOM updates
 * for the profile component.
 */
export class ProfileView {
  /**
   * Toggles visibility of an element by adding or removing the "hidden" class.
   *
   * @param elementId - The ID of the element to show or hide.
   * @param show - True to show the element; false to hide it.
   */
  static toggleVisibility(elementId: string, show: boolean): void {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.toggle("hidden", !show)
    }
  }

  /**
   * Shows a notification message
   * @param container - The container element
   * @param message - The notification message
   * @param type - The notification type ('success' or 'error')
   */
  static showNotification(container: HTMLElement, message: string, type: "success" | "error" = "success"): void {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    container.appendChild(notification)

    setTimeout(() => {
      if (container.contains(notification)) {
        container.removeChild(notification)
      }
    }, 3000)
  }
}
