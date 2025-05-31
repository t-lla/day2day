export class StorageService {
  private get userId(): string | null {
    return localStorage.getItem('current_user_id');
  }

  private key(raw: string): string {
    return this.userId ? `${this.userId}:${raw}` : raw;
  }

  get<T>(raw: string, fallback: T | null): T {
    const k = this.key(raw);
    const json = localStorage.getItem(k);
    return json ? (JSON.parse(json) as T) : (fallback as T);
    }

  set(raw: string, value: unknown): void {
    const k = this.key(raw);
    localStorage.setItem(k, JSON.stringify(value));
  }

  clearNamespace(): void {
    if (!this.userId) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(`${this.userId}:`))
      .forEach((k) => localStorage.removeItem(k));
  }
}

export const storageService = new StorageService();
