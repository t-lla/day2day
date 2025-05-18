/**
 * @packageDocumentation
 * @module Types
 *
 * Defines shared data interfaces used across the application,
 * including Note, Task, Habit, and Finance structures.
 */

/**
 * Represents a note entry in the application.
 *
 * @example
 * const note: Note = {
 *   id: "1",
 *   title: "new note",
 *   content: "note content",
 *   createdAt: "2025-05-03T10:00:00Z",
 *   updatedAt: "2025-05-03T10:00:00Z",
 *   tags: ["new", "note"]
 * };
 */
export interface Note {
  /** Unique identifier for the note. */
  id: string

  /** Title/heading of the note. */
  title: string

  /** Main content or body text of the note. */
  content: string

  /** ISO timestamp string when the note was created. */
  createdAt: string

  /** ISO timestamp string when the note was last updated. */
  updatedAt: string

  /** Array of tags within note. */
  tags: string[]
}

/**
 * Represents a task entry in the application.
 *
 * @example
 * const task: Task = {
 *   id: "1",
 *   title: "new task",
 *   description: "task content",
 *   dueDate: "10-05-2025",
 *   priority: "high",
 *   completed: false,
 *   createdAt: "2025-05-03T10:00:00Z"
 * };
 */
export interface Task {
  /** Unique identifier for the task. */
  id: string

  /** Title/heading of the task. */
  title: string

  /** Detailed description of the task. */
  description: string

  /** Due date for the task in DD-MM-YYYY format, or null if none set. */
  dueDate: string | null

  /** Priority level of the task: low, medium, or high. */
  priority: "low" | "medium" | "high"

  /** Completion status of the task. */
  completed: boolean

  /** ISO timestamp string when the task was created. */
  createdAt: string
}

/**
 * Represents a habit entry in the application.
 *
 * @example
 * const habit: Habit = {
 *   id: "1",
 *   name: "Daily Exercise",
 *   description: "30 minutes of cardio",
 *   frequency: "daily",
 *   completedDates: ["2025-05-01", "2025-05-02"],
 *   createdAt: "2025-05-01T10:00:00Z"
 * };
 */
export interface Habit {
  /** Unique identifier for the habit. */
  id: string

  /** Name of the habit. */
  name: string

  /** Detailed description of the habit. */
  description: string

  /** Frequency of the habit: daily, weekly, or monthly. */
  frequency: "daily" | "weekly" | "monthly"

  /** Array of ISO date strings when the habit was completed. */
  completedDates: string[]

  /** ISO timestamp string when the habit was created. */
  createdAt: string
}

/**
 * Represents a financial account in the application.
 *
 * @example
 * const account: Account = {
 *   id: "1",
 *   name: "Main Checking",
 *   type: "debit",
 *   balance: 1500.50,
 *   color: "#40e07d",
 *   currency: "USD",
 *   isDefault: true
 * };
 */
export interface Account {
  /** Unique identifier for the account. */
  id: string

  /** Name of the account. */
  name: string

  /** Type of the account: credit, debit, savings, cash, or investment. */
  type: "credit" | "debit" | "savings" | "cash" | "investment"

  /** Current balance of the account. */
  balance: number

  /** Color code for the account display. */
  color: string

  /** Currency code for the account. */
  currency: string

  /** Whether this is the default account. */
  isDefault?: boolean
}

/**
 * Represents a transaction category in the application.
 *
 * @example
 * const category: Category = {
 *   id: "expense-food",
 *   name: "Food",
 *   type: "expense",
 *   color: "#ff6b6b",
 *   isFixed: false,
 *   monthlyBudget: 300
 * };
 */
export interface Category {
  /** Unique identifier for the category. */
  id: string

  /** Name of the category. */
  name: string

  /** Type of the category: income or expense. */
  type: "income" | "expense"

  /** Color code for the category display. */
  color?: string

  /** Whether this is a fixed expense. */
  isFixed?: boolean

  /** Monthly budget amount for this category. */
  monthlyBudget?: number
}

/**
 * Represents a financial transaction in the application.
 *
 * @example
 * const transaction: Transaction = {
 *   id: "1",
 *   date: "2025-05-01T10:00:00Z",
 *   description: "Grocery shopping",
 *   amount: 85.75,
 *   type: "expense",
 *   categoryId: "expense-food",
 *   accountId: "checking-account",
 *   isRecurring: false
 * };
 */
export interface Transaction {
  /** Unique identifier for the transaction. */
  id: string

  /** ISO timestamp string when the transaction occurred. */
  date: string

  /** Description of the transaction. */
  description: string

  /** Amount of the transaction. */
  amount: number

  /** Type of the transaction: income, expense, or transfer. */
  type: "income" | "expense" | "transfer"

  /** ID of the category this transaction belongs to. */
  categoryId: string

  /** ID of the account this transaction belongs to. */
  accountId: string

  /** ID of the destination account for transfers. */
  toAccountId?: string

  /** Whether this is a recurring transaction. */
  isRecurring?: boolean

  /** Frequency of recurrence: monthly, weekly, or yearly. */
  recurringFrequency?: "monthly" | "weekly" | "yearly"
}

/**
 * Represents a budget for a category in a specific month and year.
 *
 * @example
 * const budget: Budget = {
 *   categoryId: "expense-food",
 *   month: 4, // May (0-indexed)
 *   year: 2025,
 *   amount: 300
 * };
 */
export interface Budget {
  /** ID of the category this budget is for. */
  categoryId: string

  /** Month (0-11) this budget is for. */
  month: number

  /** Year this budget is for. */
  year: number

  /** Budget amount. */
  amount: number
}
