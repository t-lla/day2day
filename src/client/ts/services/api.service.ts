import type { Folder } from "../components/folders/folders.model"
import type { Account, Budget, Category, Habit, Note, Task, Transaction } from "../types"
import { storageService } from "./storage.service.js"

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

export interface User {
  id: string
  username: string
  email?: string
  name?: string
  theme?: string
  createdAt: string
  updatedAt?: string
}

export class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "http://localhost:3001/api") {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem("auth_token") || null
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    }
    if (this.token) headers.Authorization = `Bearer ${this.token}`

    let res: Response
    try {
      res = await fetch(url, { ...options, headers })
    } catch (error) {
      console.error("Network error:", error)
      return { status: 0, error: "Network error" }
    }

    const isJson = (res.headers.get("content-type") || "").includes("application/json")
    const body: any = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      console.error("API Error:", res.status, body)
      return {
        status: res.status,
        error: (isJson && (body.error || body.message)) || (body ? String(body) : "Request failed"),
      }
    }

    return { status: res.status, data: body as T }
  }

  async login(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log("Attempting login for:", username)
    const response = await this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })

    if (response.data?.token && response.data.user) {
      console.log("Login successful, user:", response.data.user)
      localStorage.removeItem("offline_mode")
      this.token = response.data.token
      localStorage.setItem("auth_token", response.data.token)
      localStorage.setItem("current_user_id", response.data.user.id.toString())
      localStorage.setItem("user", JSON.stringify(response.data.user))
      storageService.clearNamespace()
    } else {
      console.error("Login failed:", response.error)
    }
    return response
  }

  async register(
    username: string,
    password: string,
    email?: string,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log("Attempting registration for:", username)
    const response = await this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    })

    if (response.data?.token && response.data.user) {
      console.log("Registration successful, user:", response.data.user)
      localStorage.removeItem("offline_mode")
      this.token = response.data.token
      localStorage.setItem("auth_token", response.data.token)
      localStorage.setItem("current_user_id", response.data.user.id.toString())
      localStorage.setItem("user", JSON.stringify(response.data.user))
      storageService.clearNamespace()
    } else {
      console.error("Registration failed:", response.error)
    }
    return response
  }

  private currentUserId(): number | null {
    const id = localStorage.getItem("current_user_id")
    if (!id || id === "offline") return null
    const numId = Number.parseInt(id, 10)
    return isNaN(numId) ? null : numId
  }

  logout(): void {
    this.token = null
    localStorage.removeItem("auth_token")
    localStorage.removeItem("current_user_id")
    localStorage.removeItem("user")
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUserId()
  }

  /* GET current profile */
  async getProfile() {
    const id = this.currentUserId()
    return id ? this.request<User>(`/users/${id}`) : { status: 400, error: "Not authenticated" }
  }

  /* PUT profile */
  async updateProfile(data: Partial<User>) {
    const id = this.currentUserId()
    return id ? this.request<User>(`/users/${id}`, {
      method: "PUT", body: JSON.stringify(data),
    }) : { status: 400, error: "Not signed in" }
  }

  async syncHabits(habits: any[]): Promise<ApiResponse<any[]>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Syncing habits for user:", userId)
    return this.request<any[]>("/habits/sync", {
      method: "POST",
      body: JSON.stringify({ userId, habits }),
    })
  }

  async syncNotes(notes: any[]): Promise<ApiResponse<any[]>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Syncing notes for user:", userId)
    return this.request<any[]>("/notes/sync", {
      method: "POST",
      body: JSON.stringify({ userId, notes }),
    })
  }

  async syncTasks(tasks: any[]): Promise<ApiResponse<any[]>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Syncing tasks for user:", userId)
    return this.request<any[]>("/tasks/sync", {
      method: "POST",
      body: JSON.stringify({ userId, tasks }),
    })
  }

  async syncFinances(data: any): Promise<ApiResponse<any>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Syncing finances for user:", userId)
    return this.request<any>("/finances/sync", {
      method: "POST",
      body: JSON.stringify({ userId, ...data }),
    })
  }

  /**  Crea un folder para el usuario logueado */
  async createFolder(
    name: string,
    description: string,
    color?: string,
  ): Promise<ApiResponse<Folder>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }

    return this.request<Folder>("/folders", {
      method: "POST",
      body: JSON.stringify({ userId, name, description, color }),
    })
  }

  /** Actualiza nombre/descr. de una carpeta */
  async updateFolder(
    id: string,
    payload: Partial<Omit<Folder, "id">>,
  ): Promise<ApiResponse<Folder>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }

    return this.request<Folder>(`/folders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ userId, ...payload }),
    })
  }

  async syncFolders(folders: any[]): Promise<ApiResponse<any[]>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Syncing folders for user:", userId)
    return this.request<any[]>("/folders/sync", {
      method: "POST",
      body: JSON.stringify({ userId, folders }),
    })
  }

  /** POST /folder_items/sync  – envía todos los FolderItem del usuario */
  async syncFolderItems(items: any[]): Promise<ApiResponse<any[]>> {
    const userId = this.currentUserId();
    if (!userId) return { status: 400, error: 'Not authenticated' };

    return this.request<any[]>('/folderitems/sync', {
      method: 'POST',
      body: JSON.stringify({ userId, items }),
    });
  }

  async getNotes(): Promise<ApiResponse<Note[]>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Getting notes for user:", userId)
    return this.request<Note[]>(`/notes?userId=${userId}`)
  }

  async getTasks() {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Getting tasks for user:", userId)
    return this.request<Task[]>(`/tasks?userId=${userId}`)
  }

  async getHabits() {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Getting habits for user:", userId)
    return this.request<Habit[]>(`/habits?userId=${userId}`)
  }

  async getAccounts() {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Getting accounts for user:", userId)
    return this.request<Account[]>(`/finances/accounts?userId=${userId}`)
  }

  async getCategories() {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Getting categories for user:", userId)
    return this.request<Category[]>(`/finances/categories?userId=${userId}`)
  }

  async getTransactions() {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Getting transactions for user:", userId)
    return this.request<Transaction[]>(`/finances/transactions?userId=${userId}`)
    }

    async createTransaction(
    tx: Omit<Transaction, 'id'> & { userId: string }
    ) {
      const clean = {
      ...tx,
      accountId: isFinite(+tx.accountId) ? +tx.accountId : undefined,
      categoryId:
        tx.categoryId === '' || isNaN(+tx.categoryId) ? null : +tx.categoryId,
      toAccountId:
        tx.toAccountId === undefined || tx.toAccountId === null || isNaN(+tx.toAccountId)
          ? null
          : +tx.toAccountId,
      amount: +tx.amount,
      date: new Date(tx.date).toISOString().substring(0, 10),
    }

    return this.request<Transaction>("/finances/transactions", {
      method: "POST",
      body: JSON.stringify(clean),
    })
  }

  async createAccount(acc: Omit<Account, 'id'> & { userId: string }) {
    return this.request<Account>('/finances/accounts', {
      method: 'POST',
      body: JSON.stringify(acc),
    });
  }

  async createCategory(
    cat: Omit<Category, "id"> & { userId: string },
  ): Promise<ApiResponse<Category>> {
    const payload = {
      ...cat,
      color: cat.color?.trim() || null,
      monthlyBudget:
        cat.monthlyBudget === undefined || isNaN(+cat.monthlyBudget)
          ? null
          : +cat.monthlyBudget,
    }

    return this.request<Category>("/finances/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async getBudgets(): Promise<ApiResponse<Budget[]>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated", data: undefined }
    return this.request<Budget[]>(`/finances/budgets?userId=${userId}`)
  }

  async createBudget(
    budget: Budget & { userId: string },
  ): Promise<ApiResponse<Budget>> {
    const payload = {
      ...budget,
      categoryId: +budget.categoryId,
      month: +budget.month,
      year: +budget.year,
      amount: +budget.amount,
    }

    return this.request<Budget>("/finances/budgets", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async getFolders() {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    console.log("Getting folders for user:", userId)
    return this.request<Folder[]>(`/folders?userId=${userId}`)
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    return this.request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify({ userId, ...task }),
    })
  }

  async updateTask(
    id: string,
    payload: {
      title: string;
      description: string | null;
      dueDate: string | null;
      priority: Task["priority"];
      completed: boolean;
    }
  ): Promise<ApiResponse<Task>> {
    const userId = this.currentUserId();
    if (!userId) return { status: 400, error: "Not authenticated" };

    return this.request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ userId, ...payload }),
    });
  }

  async createNote(note: Partial<Note>): Promise<ApiResponse<Note>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    return this.request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify({ userId, ...note }),
    })
  }

  async createHabit(habit: Partial<Habit>): Promise<ApiResponse<Habit>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    return this.request<Habit>("/habits", {
      method: "POST",
      body: JSON.stringify({ userId, ...habit }),
    })
  }

  async deleteHabit(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const userId = this.currentUserId()
    if (!userId) return { status: 400, error: "Not authenticated" }
    return this.request<{ success: boolean }>(`/habits/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    })
  }

/**
 * POST /habits/:id/complete
 * Marca un hábito como completado para la fecha indicada.
 */
async completeHabit(
  id: string,
  date: string, // formato "YYYY-MM-DD"
): Promise<ApiResponse<{ success: boolean; log_id: number; completion_date: string }>> {
  const userId = this.currentUserId();
  if (!userId) return { status: 400, error: "Not authenticated" };

  return this.request<{ success: boolean; log_id: number; completion_date: string }>(
    `/habits/${id}/complete`,
    {
      method: "POST",
      body: JSON.stringify({ userId, date }),
    }
  );
}

/**
 * DELETE /habits/:id/complete?date=YYYY-MM-DD
 * Desmarca un hábito como completado para la fecha indicada.
 */
async uncompleteHabit(
  id: string,
  date: string,
): Promise<ApiResponse<{ success: boolean }>> {
  const userId = this.currentUserId();
  if (!userId) return { status: 400, error: "Not authenticated" };

  return this.request<{ success: boolean }>(
    `/habits/${id}/complete`,
    {
      method: "DELETE",

      body: JSON.stringify({ userId, date }),
    }
  );
}

  /** Delete an existing task (hard‑delete).
   *  The backend route expects the userId as a query param.
   */
  async deleteTask(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const userId = this.currentUserId();
    if (!userId) return { status: 400, error: "Not authenticated" };
    return this.request<{ success: boolean }>(`/tasks/${id}?userId=${userId}`, {
      method: "DELETE",
    });
  }

  /** Update an existing note. */
  async updateNote(
    id: string,
    payload: { title: string; content: string; tags: string[] },
  ): Promise<ApiResponse<Note>> {
    const userId = this.currentUserId();
    if (!userId) return { status: 400, error: "Not authenticated" };

    return this.request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ userId, ...payload }),
    });
  }

  /** Delete a note permanently. */
  async deleteNote(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const userId = this.currentUserId();
    if (!userId) return { status: 400, error: "Not authenticated" };
    return this.request<{ success: boolean }>(`/notes/${id}?userId=${userId}`, {
      method: "DELETE",
    });
  }
  
}

export const apiService = new ApiService()
