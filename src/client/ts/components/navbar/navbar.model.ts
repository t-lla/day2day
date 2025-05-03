/**
 * @packageDocumentation
 * @module NavbarModel
 *
 * Model responsible for managing user authentication data
 * in the browser's localStorage for the navigation bar.
 */

/**
 * NavbarModel provides methods to get, set, remove, and check
 * user login state stored in localStorage.
 */
export class NavbarModel {
  /**
   * Retrieves the stored user object from localStorage.
   *
   * @returns The parsed user object if present; otherwise, null.
   */
  getUser(): any {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  /**
   * Stores the given user object in localStorage under the key "user".
   *
   * @param user - The user data object to store.
   */
  setUser(user: any): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  /** Removes the stored user object from localStorage. */
  removeUser(): void {
    localStorage.removeItem("user");
  }

  /**
   * Checks whether a user is currently logged in by checking localStorage.
   *
   * @returns True if a user object exists in storage; otherwise, false.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem("user");
  }
}
