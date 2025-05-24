/**
 * @packageDocumentation
 * @module FinancesModel
 *
 * Data model for the finances tracker component.
 * Handles storage, retrieval, and manipulation of financial data.
 */

/**
 * Represents a financial account (credit card, bank account, etc.)
 */
export interface Account {
  id: string
  name: string
  type: "credit" | "debit" | "savings" | "cash" | "investment"
  balance: number
  color: string
  currency: string
  isDefault?: boolean
}

/**
 * Represents a transaction category
 */
export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color?: string
  isFixed?: boolean
  monthlyBudget?: number
}

/**
 * Represents a financial transaction
 */
export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense" | "transfer"
  categoryId: string
  accountId: string
  toAccountId?: string
  isRecurring?: boolean
  recurringFrequency?: "monthly" | "weekly" | "yearly"
}

/**
 * Represents a monthly budget for a category
 */
export interface Budget {
  categoryId: string
  month: number // 0-11
  year: number
  amount: number
}

/**
 * Represents a monthly summary
 */
export interface MonthlySummary {
  month: number
  year: number
  startingBalance: number
  endingBalance: number
  totalIncome: number
  totalExpenses: number
  savedAmount: number
  categoryTotals: Record<string, number>
}

const DEFAULT_CATEGORIES: Category[] = [ //default categories
  { id: "income-salary", name: "Salary", type: "income", color: "#40e07d" },
  { id: "income-other", name: "Other Income", type: "income", color: "#40e07d" },
  { id: "expense-food", name: "Food", type: "expense", color: "#ff6b6b" },
  { id: "expense-housing", name: "Housing", type: "expense", color: "#ff6b6b", isFixed: true },
  { id: "expense-transport", name: "Transportation", type: "expense", color: "#ff6b6b" },
  { id: "expense-outting", name: "Outting", type: "expense", color: "#ff6b6b" },
  { id: "expense-other", name: "Other Expenses", type: "expense", color: "#ff6b6b" },
]

const DEFAULT_ACCOUNT: Account = { //default account
  id: "default-account",
  name: "1st account",
  type: "debit",
  balance: 0,
  color: "#40e07d",
  currency: "EUR",
  isDefault: true,
}

/**
 * Class for managing financial data
 */
export class FinancesModel {
  private accounts: Account[] = []
  private transactions: Transaction[] = []
  private categories: Category[] = []
  private budgets: Budget[] = []

  /**
   * Initializes the finances model by loading data from localStorage
   */
  constructor() {
    this.loadData()
  }

  /**
   * Loads financial data from localStorage
   */
  private loadData(): void {
    try {
      const accountsData = localStorage.getItem("finances_accounts")
      const transactionsData = localStorage.getItem("finances_transactions")
      const categoriesData = localStorage.getItem("finances_categories")
      const budgetsData = localStorage.getItem("finances_budgets")

      this.accounts = accountsData ? JSON.parse(accountsData) : [DEFAULT_ACCOUNT]
      this.transactions = transactionsData ? JSON.parse(transactionsData) : []
      this.categories = categoriesData ? JSON.parse(categoriesData) : DEFAULT_CATEGORIES
      this.budgets = budgetsData ? JSON.parse(budgetsData) : []

      if (this.accounts.length === 0) {
        this.accounts = [DEFAULT_ACCOUNT]
      }

      if (this.categories.length === 0) {
        this.categories = DEFAULT_CATEGORIES
      }

      this.saveData()
    } catch (error) {
      console.error("Error loading finances data:", error)
      this.accounts = [DEFAULT_ACCOUNT]
      this.categories = DEFAULT_CATEGORIES
      this.transactions = []
      this.budgets = []
      this.saveData()
    }
  }

  /**
   * Saves financial data to localStorage
   */
  private saveData(): void {
    localStorage.setItem("finances_accounts", JSON.stringify(this.accounts))
    localStorage.setItem("finances_transactions", JSON.stringify(this.transactions))
    localStorage.setItem("finances_categories", JSON.stringify(this.categories))
    localStorage.setItem("finances_budgets", JSON.stringify(this.budgets))
  }

  /**
   * Gets all accounts
   * @returns Array of accounts
   */
  getAccounts(): Account[] {
    return [...this.accounts]
  }

  /**
   * Gets an account by ID
   * @param id - The account ID
   * @returns The account or undefined if not found
   */
  getAccountById(id: string): Account | undefined {
    return this.accounts.find((account) => account.id === id)
  }

  /**
   * Gets the default account
   * @returns The default account or the first account if no default is set
   */
  getDefaultAccount(): Account {
    const defaultAccount = this.accounts.find((account) => account.isDefault)
    return defaultAccount || this.accounts[0] || DEFAULT_ACCOUNT
  }

  /**
   * Adds a new account
   * @param account - The account to add
   * @returns The added account
   */
  addAccount(account: Omit<Account, "id">): Account {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    }

    if (this.accounts.length === 0 || newAccount.isDefault) {
      this.accounts.forEach((acc) => {
        acc.isDefault = false
      })
      newAccount.isDefault = true
    }

    this.accounts.push(newAccount)
    this.saveData()
    return newAccount
  }

  /**
   * Updates an existing account
   * @param id - The account ID
   * @param updates - The account updates
   * @returns The updated account or undefined if not found
   */
  updateAccount(id: string, updates: Partial<Account>): Account | undefined {
    const index = this.accounts.findIndex((account) => account.id === id)
    if (index === -1) return undefined

    if (updates.isDefault) {
      this.accounts.forEach((acc) => {
        acc.isDefault = false
      })
    }

    this.accounts[index] = { ...this.accounts[index], ...updates }
    this.saveData()
    return this.accounts[index]
  }

  /**
   * Deletes an account
   * @param id - The account ID
   * @returns True if the account was deleted, false otherwise
   */
  deleteAccount(id: string): boolean {
    const initialLength = this.accounts.length
    this.accounts = this.accounts.filter((account) => account.id !== id)

    if (initialLength !== this.accounts.length) {
      const wasDefault = !this.accounts.some((acc) => acc.isDefault)
      if (wasDefault && this.accounts.length > 0) {
        this.accounts[0].isDefault = true
      }

      this.transactions = this.transactions.filter(
        (transaction) => transaction.accountId !== id && transaction.toAccountId !== id,
      )

      this.saveData()
      return true
    }

    return false
  }

  /**
   * Gets all categories
   * @returns Array of categories
   */
  getCategories(): Category[] {
    return [...this.categories]
  }

  /**
   * Gets categories by type
   * @param type - The category type ('income' or 'expense')
   * @returns Array of categories of the specified type
   */
  getCategoriesByType(type: "income" | "expense"): Category[] {
    return this.categories.filter((category) => category.type === type)
  }

  /**
   * Gets a category by ID
   * @param id - The category ID
   * @returns The category or undefined if not found
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories.find((category) => category.id === id)
  }

  /**
   * Adds a new category
   * @param category - The category to add
   * @returns The added category
   */
  addCategory(category: Omit<Category, "id">): Category {
    const newCategory: Category = {
      ...category,
      id: `${category.type}-${Date.now()}`,
    }

    this.categories.push(newCategory)
    this.saveData()
    return newCategory
  }

  /**
   * Updates an existing category
   * @param id - The category ID
   * @param updates - The category updates
   * @returns The updated category or undefined if not found
   */
  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const index = this.categories.findIndex((category) => category.id === id)
    if (index === -1) return undefined

    this.categories[index] = { ...this.categories[index], ...updates }
    this.saveData()
    return this.categories[index]
  }

  /**
   * Deletes a category
   * @param id - The category ID
   * @returns True if the category was deleted, false otherwise
   */
  deleteCategory(id: string): boolean {
    const initialLength = this.categories.length
    this.categories = this.categories.filter((category) => category.id !== id)

    if (initialLength !== this.categories.length) {

      const type = id.startsWith("income") ? "income" : "expense"
      const defaultCategoryId = type === "income" ? "income-other" : "expense-other"

      this.transactions.forEach((transaction) => {
        if (transaction.categoryId === id) {
          transaction.categoryId = defaultCategoryId
        }
      })

      this.budgets = this.budgets.filter((budget) => budget.categoryId !== id)

      this.saveData()
      return true
    }

    return false
  }

  /**
   * Gets all transactions
   * @returns Array of transactions
   */
  getAllTransactions(): Transaction[] {
    return [...this.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * Gets transactions for a specific account
   * @param accountId - The account ID
   * @returns Array of transactions for the account
   */
  getTransactionsByAccount(accountId: string): Transaction[] {
    return this.transactions
      .filter((transaction) => transaction.accountId === accountId || transaction.toAccountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * Gets transactions for a specific month and year
   * @param month - The month (0-11)
   * @param year - The year
   * @returns Array of transactions for the month and year
   */
  getTransactionsByMonth(month: number, year: number): Transaction[] {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    return this.transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * Gets a transaction by ID
   * @param id - The transaction ID
   * @returns The transaction or undefined if not found
   */
  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find((transaction) => transaction.id === id)
  }

  /**
   * Adds a new transaction
   * @param transaction - The transaction to add
   * @returns The added transaction
   */
  addTransaction(transaction: Omit<Transaction, "id">): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }

    this.transactions.push(newTransaction)
    this.updateAccountBalances(newTransaction)
    this.saveData()
    return newTransaction
  }

  /**
   * Updates an existing transaction
   * @param id - The transaction ID
   * @param updates - The transaction updates
   * @returns The updated transaction or undefined if not found
   */
  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const index = this.transactions.findIndex((transaction) => transaction.id === id)
    if (index === -1) return undefined

    const oldTransaction = this.transactions[index]
    const newTransaction = { ...oldTransaction, ...updates }

    this.updateAccountBalances(oldTransaction, true)

    this.transactions[index] = newTransaction
    this.updateAccountBalances(newTransaction)

    this.saveData()
    return this.transactions[index]
  }

  /**
   * Deletes a transaction
   * @param id - The transaction ID
   * @returns True if the transaction was deleted, false otherwise
   */
  deleteTransaction(id: string): boolean {
    const transaction = this.getTransactionById(id)
    if (!transaction) return false

    this.updateAccountBalances(transaction, true)

    this.transactions = this.transactions.filter((t) => t.id !== id)
    this.saveData()
    return true
  }

  /**
   * Updates account balances based on a transaction
   * @param transaction - The transaction
   * @param revert - Whether to revert the transaction (for updates/deletes)
   */
  private updateAccountBalances(transaction: Transaction, revert = false): void {
    const multiplier = revert ? -1 : 1

    const account = this.getAccountById(transaction.accountId)
    if (!account) return

    if (transaction.type === "income") {
      account.balance += transaction.amount * multiplier
    } else if (transaction.type === "expense") {
      account.balance -= transaction.amount * multiplier
    } else if (transaction.type === "transfer" && transaction.toAccountId) {
      account.balance -= transaction.amount * multiplier

      const toAccount = this.getAccountById(transaction.toAccountId)
      if (toAccount) {
        toAccount.balance += transaction.amount * multiplier
      }
    }
  }

  /**
   * Gets all budgets
   * @returns Array of budgets
   */
  getBudgets(): Budget[] {
    return [...this.budgets]
  }

  /**
   * Gets budgets for a specific month and year
   * @param month - The month (0-11)
   * @param year - The year
   * @returns Array of budgets for the month and year
   */
  getBudgetsByMonth(month: number, year: number): Budget[] {
    return this.budgets.filter((budget) => budget.month === month && budget.year === year)
  }

  /**
   * Sets a budget for a category in a specific month and year
   * @param categoryId - The category ID
   * @param month - The month (0-11)
   * @param year - The year
   * @param amount - The budget amount
   * @returns The budget
   */
  setBudget(categoryId: string, month: number, year: number, amount: number): Budget {
    const existingIndex = this.budgets.findIndex(
      (budget) => budget.categoryId === categoryId && budget.month === month && budget.year === year,
    )

    const budget: Budget = { categoryId, month, year, amount }

    if (existingIndex !== -1) {
      this.budgets[existingIndex] = budget
    } else {
      this.budgets.push(budget)
    }

    this.saveData()
    return budget
  }

  /**
   * Deletes a budget
   * @param categoryId - The category ID
   * @param month - The month (0-11)
   * @param year - The year
   * @returns True if the budget was deleted, false otherwise
   */
  deleteBudget(categoryId: string, month: number, year: number): boolean {
    const initialLength = this.budgets.length
    this.budgets = this.budgets.filter(
      (budget) => !(budget.categoryId === categoryId && budget.month === month && budget.year === year),
    )

    if (initialLength !== this.budgets.length) {
      this.saveData()
      return true
    }

    return false
  }

  /**
   * Gets a monthly summary
   * @param month - The month (0-11)
   * @param year - The year
   * @returns The monthly summary
   */
  getMonthlySummary(month: number, year: number): MonthlySummary {
    const transactions = this.getTransactionsByMonth(month, year)

    let startingBalance = 0
    this.accounts.forEach((account) => {

      const prevTransactions = this.transactions.filter((t) => {
        const date = new Date(t.date)
        return (
          (date.getFullYear() < year || (date.getFullYear() === year && date.getMonth() < month)) &&
          (t.accountId === account.id || t.toAccountId === account.id)
        )
      })

      let balance = 0
      prevTransactions.forEach((t) => {
        if (t.accountId === account.id) {
          if (t.type === "income") balance += t.amount
          else if (t.type === "expense") balance -= t.amount
          else if (t.type === "transfer") balance -= t.amount
        }
        if (t.toAccountId === account.id && t.type === "transfer") {
          balance += t.amount
        }
      })

      startingBalance += balance
    })

    let totalIncome = 0
    let totalExpenses = 0
    const categoryTotals: Record<string, number> = {}

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount
        categoryTotals[transaction.categoryId] = (categoryTotals[transaction.categoryId] || 0) + transaction.amount
      } else if (transaction.type === "expense") {
        totalExpenses += transaction.amount
        categoryTotals[transaction.categoryId] = (categoryTotals[transaction.categoryId] || 0) + transaction.amount
      }

    })

    const endingBalance = startingBalance + totalIncome - totalExpenses
    const savedAmount = totalIncome - totalExpenses

    return {
      month,
      year,
      startingBalance,
      endingBalance,
      totalIncome,
      totalExpenses,
      savedAmount,
      categoryTotals,
    }
  }

  /**
   * Gets spending by category for a specific month and year
   * @param month - The month (0-11)
   * @param year - The year
   * @returns Record of category IDs to total amounts
   */
  getSpendingByCategory(month: number, year: number): Record<string, number> {
    const transactions = this.getTransactionsByMonth(month, year)
    const categoryTotals: Record<string, number> = {}

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        categoryTotals[transaction.categoryId] = (categoryTotals[transaction.categoryId] || 0) + transaction.amount
      }
    })

    return categoryTotals
  }

  /**
   * Gets income by category for a specific month and year
   * @param month - The month (0-11)
   * @param year - The year
   * @returns Record of category IDs to total amounts
   */
  getIncomeByCategory(month: number, year: number): Record<string, number> {
    const transactions = this.getTransactionsByMonth(month, year)
    const categoryTotals: Record<string, number> = {}

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        categoryTotals[transaction.categoryId] = (categoryTotals[transaction.categoryId] || 0) + transaction.amount
      }
    })

    return categoryTotals
  }

  /**
   * Gets the total balance across all accounts
   * @returns The total balance
   */
  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.balance, 0)
  }

  /**
   * Creates recurring transactions for the current month
   * @returns Array of created transactions
   */
  createRecurringTransactionsForCurrentMonth(): Transaction[] {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const recurringTransactions = this.transactions.filter((t) => t.isRecurring)

    const transactionsToCreate: Transaction[] = []

    recurringTransactions.forEach((transaction) => {

      const existingTransaction = this.transactions.find((t) => {
        if (!t.isRecurring) return false

        const date = new Date(t.date)
        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          t.description === transaction.description &&
          t.categoryId === transaction.categoryId &&
          t.accountId === transaction.accountId
        )
      })

      if (!existingTransaction) {

        const newDate = new Date(currentYear, currentMonth, now.getDate())

        transactionsToCreate.push({
          ...transaction,
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          date: newDate.toISOString(),
        })
      }
    })

    transactionsToCreate.forEach((transaction) => {
      this.transactions.push(transaction)
      this.updateAccountBalances(transaction)
    })

    if (transactionsToCreate.length > 0) {
      this.saveData()
    }

    return transactionsToCreate
  }
}

export const financesModel = new FinancesModel()
