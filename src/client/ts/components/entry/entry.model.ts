/**
 * @packageDocumentation
 * @module EntryModel
 *
 * Persists authenticated user info to localStorage
 * Provides interface to store user credentials, used by the EntryController.
 */
export interface User {  
  username: string;  
  name: string;  
}

export class EntryModel {
  /**
   * Save the user object in localStorage under the key "user".
   *
   * @param user - object containing `username` and `name`
   * @example
   * const model = new EntryModel();
   * model.setUser({ username: "user1", name: "user" });
   */
  setUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }
}