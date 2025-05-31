/**
 * @packageDocumentation
 * @module SyncService
 *
 * Handles data synchronization between local storage and the backend API.
 * Implements offline-first approach with background sync capabilities.
 */

import { ApiResponse, apiService } from "./api.service.js"
import { storageService } from "./storage.service.js"

export interface SyncOperation {
  id: string
  type: "create" | "update" | "delete"
  entity: "habit" | "note" | "task" | "finance" | "folder"
  data: any
  timestamp: number
}

export class SyncService {
  private syncQueue: SyncOperation[] = []
  private isOnline: boolean = navigator.onLine
  private syncInProgress = false

  constructor() {
    this.loadSyncQueue()
    this.setupOnlineListener()
    this.startPeriodicSync()
  }

  private loadSyncQueue(): void {
    const saved = localStorage.getItem("sync_queue")
    if (saved) {
      this.syncQueue = JSON.parse(saved)
    }
  }

  private saveSyncQueue(): void {
    localStorage.setItem("sync_queue", JSON.stringify(this.syncQueue))
  }

  private setupOnlineListener(): void {
    window.addEventListener("online", () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && apiService.isAuthenticated() && !this.syncInProgress) {
        this.processSyncQueue()
      }
    }, 30000) // sync every 30s
  }

  queueOperation(operation: Omit<SyncOperation, "id" | "timestamp">): void {
    const syncOp: SyncOperation = {
      ...operation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    }

    this.syncQueue.push(syncOp)
    this.saveSyncQueue()

    if (this.isOnline && apiService.isAuthenticated()) {
      this.processSyncQueue()
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0 || !this.isOnline || !apiService.isAuthenticated()) {
      return
    }

    this.syncInProgress = true

    try {
      await this.syncAllData()
      this.syncQueue = []
      this.saveSyncQueue()
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncAllData(): Promise<void> {
    const habits  = storageService.get<any[]>("habits", []);
    const notes   = storageService.get<any[]>("notes", []);
    const tasks   = storageService.get<any[]>("tasks", []);
    const folders = storageService.get<any[]>("folders", []);

    const promises = [
      apiService.syncHabits(habits),
      apiService.syncNotes(notes),
      apiService.syncTasks(tasks),
      apiService.syncFolders(folders),
    ]

    const results = await Promise.allSettled<ApiResponse<any>>(promises);

    results.forEach(
      (result: PromiseSettledResult<ApiResponse<any>>, index: number): void => {
        if (result.status === "fulfilled" && result.value.data) {
          switch (index) {
            case 0:
              localStorage.setItem("habits", JSON.stringify(result.value.data))
              break
            case 1:
              localStorage.setItem("notes", JSON.stringify(result.value.data))
              break
            case 2:
              localStorage.setItem("tasks", JSON.stringify(result.value.data))
              break
            case 3:
              localStorage.setItem("folders", JSON.stringify(result.value.data))
              break
          }
        }
    })
  }

  async forceSync(): Promise<void> {
    if (!this.isOnline || !apiService.isAuthenticated()) {
      throw new Error("Cannot sync while offline or not authenticated")
    }

    await this.processSyncQueue()
  }

  getSyncStatus(): { pending: number; isOnline: boolean; isAuthenticated: boolean } {
    return {
      pending: this.syncQueue.length,
      isOnline: this.isOnline,
      isAuthenticated: apiService.isAuthenticated(),
    }
  }

  /**
   * Boot-sync: baja todos los recursos del servidor
   * y los guarda en localStorage.
   */
  async initialLoad(): Promise<void> {

    if (!apiService.isAuthenticated()) {
      localStorage.setItem("offline_mode", "true");
      return;
    }
    localStorage.removeItem("offline_mode");
    storageService.clearNamespace();

    const [ notesR, tasksR, habitsR, foldersR, accountsR, categoriesR, transactionsR ] =
      await Promise.all([
        apiService.getNotes(),
        apiService.getTasks(),
        apiService.getHabits(),
        apiService.getFolders(),
        apiService.getAccounts(),
        apiService.getCategories(),
        apiService.getTransactions(),
      ]);

    if (notesR.data) storageService.set("notes", notesR.data);
    if (tasksR.data) storageService.set("tasks", tasksR.data);
    if (habitsR.data) storageService.set("habits", habitsR.data);
    if (foldersR.data) storageService.set("folders", foldersR.data);
    if (accountsR.data) storageService.set("accounts", accountsR.data);
    if (categoriesR.data) storageService.set("categories", categoriesR.data);
    if (transactionsR.data) storageService.set("transactions", transactionsR.data);
  }
}

export async function loadCurrentUser() {
  const id = localStorage.getItem('current_user_id');
  if (!id) return null;
  const res = await fetch(`/users/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el usuario');
  return res.json();
}

export const syncService = new SyncService()
