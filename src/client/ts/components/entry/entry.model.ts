export class EntryModel {
  setUser(user: any): void {
    localStorage.setItem("user", JSON.stringify(user));
  }
}