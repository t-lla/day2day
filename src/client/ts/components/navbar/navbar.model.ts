export class NavbarModel {
  getUser(): any {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  setUser(user: any): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem("user");
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("user");
  }
}