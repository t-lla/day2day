/**
 * @packageDocumentation
 * @module FinancesController
 *
 * Controller for the finances tracker component.
 * Trabaja completamente en localStorage, sin llamadas al servidor.
 */

import { FinancesView } from "./finances.view.js"
import {
  financesModel,
  type Account,
  type Transaction,
  type Category,
} from "./finances.model.js"
import { storageService } from "../../services/storage.service.js"

/** FinancesController class for gestionar toda la funcionalidad de finanzas (localStorage). */
export class FinancesController {
  private container: HTMLElement
  private currentMonth: number
  private currentYear: number
  private selectedItemId: string | null = null
  private selectedAccountId: string | null = null
  private categoryFilter = "all"
  private typeFilter = "all"

  /**
   * Crea una nueva instancia de FinancesController.
   * @param container - El elemento HTML donde se renderiza todo.
   */
  constructor(container: HTMLElement) {
    this.container = container
    const now = new Date()
    this.currentMonth = now.getMonth()
    this.currentYear = now.getFullYear()

    this.renderDashboard()
  }

  /** Inicializa el controlador y prende los event listeners. */
  init(): void {

    financesModel.createRecurringTransactionsForCurrentMonth()
    this.setupEventListeners()
  }

  /** Configura todos los event listeners (“click”, “submit”, etc.) del componente. */
  private setupEventListeners(): void {
    window.addEventListener("finances:transactionsUpdated", () => {
      this.renderDashboard();
    });
    window.addEventListener("finances:budgetsUpdated", () => {
      this.renderDashboard();
    });
    const tabButtons = this.container.querySelectorAll(".tab-btn")
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-tab")
        if (!tabId) return

        tabButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        const tabContents = this.container.querySelectorAll(".tab-content")
        tabContents.forEach((content) => {
          content.classList.remove("active")
          if (content.id === `${tabId}Tab`) {
            content.classList.add("active")
          }
        })
      })
    })

    window.addEventListener("finances:transactionsUpdated", () => {
      this.renderDashboard();        // => summary, cuentas, tx y budgets
    });

    const accountsOverview = this.container.querySelector("#accountsOverview")
    accountsOverview?.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const card = target.closest(".account-card")
      if (!card) return

      if (card.classList.contains("add-account-card")) {
        this.showAccountForm()
        return
      }

      const accountId = card.getAttribute("data-id")
      if (!accountId) return

      if (target.classList.contains("edit-account-btn")) {
        this.editAccount(accountId)
        return
      }

      if (target.classList.contains("delete-account-btn")) {
        this.deleteAccount(accountId)
        return
      }

      this.selectAccount(accountId)
    })

    const categoryFilterEl = this.container.querySelector(
      "#categoryFilter"
    ) as HTMLSelectElement
    const typeFilterEl = this.container.querySelector(
      "#typeFilter"
    ) as HTMLSelectElement

    categoryFilterEl?.addEventListener("change", () => {
      this.categoryFilter = categoryFilterEl.value
      this.renderTransactions()
    })

    typeFilterEl?.addEventListener("change", () => {
      this.typeFilter = typeFilterEl.value
      this.renderTransactions()
    })

    const addTransactionBtn = this.container.querySelector("#addTransactionBtn")
    addTransactionBtn?.addEventListener("click", () => {
      this.showTransactionForm()
    })

    this.setupTransactionFormEventListeners()

    this.setupAccountFormEventListeners()

    const editBudgetsBtn = this.container.querySelector("#editBudgetsBtn")
    editBudgetsBtn?.addEventListener("click", () => {
      this.showBudgetForm()
    })

    this.setupBudgetFormEventListeners()

    const addCategoryBtn = this.container.querySelector("#addCategoryBtn")
    addCategoryBtn?.addEventListener("click", () => {
      this.showCategoryForm()
    })

    this.setupCategoryFormEventListeners()

    const transactionsBody = this.container.querySelector("#transactionsBody")
    transactionsBody?.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const row = target.closest("tr")
      if (!row) return

      const transactionId = row.getAttribute("data-id")
      if (!transactionId) return

      if (target.classList.contains("edit-transaction-btn")) {
        this.editTransaction(transactionId)
      } else if (target.classList.contains("delete-transaction-btn")) {
        this.deleteTransaction(transactionId)
      }
    })

    const categoriesContainer = this.container.querySelector(
      ".categories-container"
    )
    categoriesContainer?.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const card = target.closest(".category-card")
      if (!card) return

      const categoryId = card.getAttribute("data-id")
      if (!categoryId) return

      if (target.classList.contains("edit-category-btn")) {
        this.editCategory(categoryId)
      } else if (target.classList.contains("delete-category-btn")) {
        this.deleteCategory(categoryId)
      }
    })
  }

  /** Renderiza TODO el dashboard: summary, cuentas, transacciones, presupuestos, categorías. */
  private renderDashboard(): void {
    const accounts = financesModel.getAccounts()
    const summary = financesModel.getMonthlySummary(
      this.currentMonth,
      this.currentYear
    )
    const categories = financesModel.getCategories()

    FinancesView.renderFinancialSummary(this.container, summary)

    FinancesView.renderAccountsOverview(
      this.container,
      accounts,
      this.selectedAccountId
    )

    this.populateCategoryFilter(categories)
    this.renderTransactions()

    this.renderBudgets()

    FinancesView.renderCategories(this.container, categories)
  }

  /**
   * Rellena el <select id="categoryFilter"> con las categorías (income/expense).
   */
  private populateCategoryFilter(categories: Category[]): void {
    const categoryFilterEl = this.container.querySelector(
      "#categoryFilter"
    ) as HTMLSelectElement
    if (!categoryFilterEl) return

    const currentValue = categoryFilterEl.value
    while (categoryFilterEl.options.length > 1) {
      categoryFilterEl.remove(1)
    }

    const incomeGroup = document.createElement("optgroup")
    incomeGroup.label = "Income Categories"
    categories
      .filter((c) => c.type === "income")
      .forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        incomeGroup.appendChild(option)
      })
    if (incomeGroup.children.length > 0) {
      categoryFilterEl.appendChild(incomeGroup)
    }

    const expenseGroup = document.createElement("optgroup")
    expenseGroup.label = "Expense Categories"
    categories
      .filter((c) => c.type === "expense")
      .forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        expenseGroup.appendChild(option)
      })
    if (expenseGroup.children.length > 0) {
      categoryFilterEl.appendChild(expenseGroup)
    }

    if (
      currentValue &&
      Array.from(categoryFilterEl.options).some((opt) => opt.value === currentValue)
    ) {
      categoryFilterEl.value = currentValue
    } else {
      categoryFilterEl.value = "all"
      this.categoryFilter = "all"
    }
  }

  /**
   * Renderiza la lista de transacciones según cuenta, categoría y tipo filtrados.
   */
  private renderTransactions(): void {
    const categories = financesModel.getCategories()
    let transactions: Transaction[]

    if (this.selectedAccountId && this.selectedAccountId !== "all") {
      transactions = financesModel.getTransactionsByAccount(this.selectedAccountId)
    } else {
      transactions = financesModel.getAllTransactions()
    }

    if (this.categoryFilter !== "all") {
      transactions = transactions.filter(
        (t) => t.categoryId === this.categoryFilter
      )
    }
    if (this.typeFilter !== "all") {
      transactions = transactions.filter((t) => t.type === this.typeFilter)
    }

    FinancesView.renderTransactions(this.container, transactions, categories)
  }

  /**
   * Renderiza el bloque de presupuestos (Budgets) según cuenta seleccionada.
   */
  private renderBudgets(): void {
    const categories = financesModel.getCategories()
    const summary = financesModel.getMonthlySummary(
      this.currentMonth,
      this.currentYear
    )

    if (this.selectedAccountId && this.selectedAccountId !== "all") {
      const accountTransactions = financesModel.getTransactionsByAccount(
        this.selectedAccountId
      )
      const accountTransactionsForMonth = accountTransactions.filter((t) => {
        const date = new Date(t.date)
        return (
          date.getMonth() === this.currentMonth &&
          date.getFullYear() === this.currentYear
        )
      })

      let totalIncome = 0
      let totalExpenses = 0
      const categoryTotals: Record<string, number> = {}

      accountTransactionsForMonth.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += transaction.amount
          categoryTotals[transaction.categoryId] =
            (categoryTotals[transaction.categoryId] || 0) + transaction.amount
        } else if (transaction.type === "expense") {
          totalExpenses += transaction.amount
          categoryTotals[transaction.categoryId] =
            (categoryTotals[transaction.categoryId] || 0) + transaction.amount
        }
      })

      const accountSummary = {
        ...summary,
        totalIncome,
        totalExpenses,
        savedAmount: totalIncome - totalExpenses,
        categoryTotals,
      }

      FinancesView.renderBudgets(
        this.container,
        categories,
        accountSummary
      )
    } else {
      FinancesView.renderBudgets(
        this.container,
        categories,
        summary
      )
    }
  }

  /**
   * Selecciona una cuenta “accountId” y cambia a pestaña “transactions”.
   * También resalta la tarjeta de cuenta seleccionada.
   */
  private selectAccount(accountId: string | null): void {
    this.selectedAccountId = accountId

    const accountHeader = this.container.querySelector(
      "#selectedAccountHeader h3"
    ) as HTMLElement
    if (accountHeader) {
      if (accountId) {
        const account = financesModel.getAccountById(accountId)
        accountHeader.textContent = `> ${account?.name || "account"}`
      } else {
        accountHeader.textContent = "> all accounts"
      }
    }

    const accountCards = this.container.querySelectorAll(".account-card")
    accountCards.forEach((card) => {
      const cardId = card.getAttribute("data-id")
      if (cardId === accountId) {
        card.classList.add("selected")
      } else {
        card.classList.remove("selected")
      }
    })

    const tabButtons = this.container.querySelectorAll(".tab-btn")
    tabButtons.forEach((btn) => {
      if (btn.getAttribute("data-tab") === "transactions") {
        btn.classList.add("active")
      } else {
        btn.classList.remove("active")
      }
    })

    const tabContents = this.container.querySelectorAll(".tab-content")
    tabContents.forEach((content) => {
      if (content.id === "transactionsTab") {
        content.classList.add("active")
      } else {
        content.classList.remove("active")
      }
    })

    this.renderTransactions()
    this.renderBudgets()
  }

  /** Abre el modal de “Add/Edit Transaction” y lo prepara con datos (o vacío). */
  private showTransactionForm(): void {
    const accounts = financesModel.getAccounts()
    const categories = financesModel.getCategories()
    let transaction: Transaction | undefined

    if (this.selectedItemId) {
      transaction =
        financesModel.getTransactionById(this.selectedItemId)
    }

    let preSelectedAccountId = this.selectedAccountId
    if (!preSelectedAccountId && !transaction) {
      const defaultAccount = financesModel.getDefaultAccount()
      preSelectedAccountId = defaultAccount.id
    }

    FinancesView.prepareTransactionForm(
      this.container,
      accounts,
      categories,
      transaction,
      preSelectedAccountId
    )
  }

  /**
   * Configura todos los eventos (submit, change, cerrar, cancelar…) del formulario de transacción.
   * Trabaja solo en fincasModel/localStorage, sin backend.
   */
  private setupTransactionFormEventListeners(): void {
    const transactionForm = this.container.querySelector(
      "#transactionForm"
    ) as HTMLFormElement
    if (!transactionForm) return

    const typeSelect = transactionForm.querySelector(
      "#transactionType"
    ) as HTMLSelectElement
    const toAccountGroup = transactionForm.querySelector(
      "#toAccountGroup"
    ) as HTMLElement
    const categoryGroup = transactionForm.querySelector(
      "#categoryGroup"
    ) as HTMLElement
    const categorySelect = transactionForm.querySelector(
      "#transactionCategory"
    ) as HTMLSelectElement

    typeSelect?.addEventListener("change", () => {
      const type = typeSelect.value as "income" | "expense" | "transfer"
      if (type === "transfer") {
        toAccountGroup.style.display = "flex"
        categoryGroup.style.display = "none"
      } else {
        toAccountGroup.style.display = "none"
        categoryGroup.style.display = "flex"

        const incomeGroup = categorySelect.querySelector(
          "#incomeCategoriesGroup"
        ) as HTMLOptGroupElement
        const expenseGroup = categorySelect.querySelector(
          "#expenseCategoriesGroup"
        ) as HTMLOptGroupElement

        if (incomeGroup && expenseGroup) {
          if (type === "income") {
            incomeGroup.style.display = ""
            expenseGroup.style.display = "none"
            const firstIncomeOption =
              incomeGroup.querySelector("option")
            if (firstIncomeOption) {
              categorySelect.value = firstIncomeOption.value
            }
          } else {
            incomeGroup.style.display = "none"
            expenseGroup.style.display = ""
            const firstExpenseOption =
              expenseGroup.querySelector("option")
            if (firstExpenseOption) {
              categorySelect.value = firstExpenseOption.value
            }
          }
        }
      }
    })

    const recurringCheckbox = transactionForm.querySelector(
      "#transactionRecurring"
    ) as HTMLInputElement
    const recurringFrequencyGroup = transactionForm.querySelector(
      "#recurringFrequencyGroup"
    ) as HTMLElement
    recurringCheckbox?.addEventListener("change", () => {
      recurringFrequencyGroup.style.display = recurringCheckbox.checked
        ? "flex"
        : "none"
    })

    const closeBtn = transactionForm.querySelector(
      ".close-btn"
    ) as HTMLButtonElement
    closeBtn?.addEventListener("click", () => {
      this.selectedItemId = null
      FinancesView.hideForm(
        this.container,
        "transactionFormContainer"
      )
    })

    const cancelBtn = transactionForm.querySelector(
      "#cancelTransactionBtn"
    ) as HTMLButtonElement
    cancelBtn?.addEventListener("click", () => {
      this.selectedItemId = null
      FinancesView.hideForm(
        this.container,
        "transactionFormContainer"
      )
    })

    transactionForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const type = typeSelect.value as
        | "income"
        | "expense"
        | "transfer"
      const date = (transactionForm.querySelector(
        "#transactionDate"
      ) as HTMLInputElement).value
      const amount = Number.parseFloat(
        (transactionForm.querySelector(
          "#transactionAmount"
        ) as HTMLInputElement).value
      )
      const description = (
        transactionForm.querySelector(
          "#transactionDescription"
        ) as HTMLInputElement
      ).value.trim()
      const accountId = (transactionForm.querySelector(
        "#transactionAccount"
      ) as HTMLSelectElement).value

      const toAccountId =
        type === "transfer"
          ? ((transactionForm.querySelector(
              "#transactionToAccount"
            ) as HTMLSelectElement).value || null)
          : null

      let rawCategory = (
        transactionForm.querySelector(
          "#transactionCategory"
        ) as HTMLSelectElement
      ).value

      if (type !== "transfer" && (!rawCategory || rawCategory === "")) {
        const allCats = financesModel.getCategories()
        const matching = allCats.find((c) => c.type === type)
        rawCategory = matching ? matching.id : ""
      }
      const categoryId =
        type !== "transfer" && rawCategory !== "" ? rawCategory : null

      const isRecurring = recurringCheckbox.checked
      const recurringFrequency = isRecurring
        ? ((transactionForm.querySelector(
            "#recurringFrequency"
          ) as HTMLSelectElement).value as
            | "monthly"
            | "weekly"
            | "yearly")
        : null

      const missing: string[] = []
      if (!date) missing.push("Date")
      if (!description) missing.push("Description")
      if (!accountId) missing.push("Account")
      if (isNaN(amount)) missing.push("Amount")
      if (!type) missing.push("Type")

      if (missing.length > 0) {
        FinancesView.showNotification(
          this.container,
          `Please fill: ${missing.join(", ")}`,
          "error"
        )
        return
      }

      const transactionData: Omit<Transaction, "id"> = {
        date: new Date(date).toISOString(),
        description,
        amount,
        type,
        categoryId: categoryId as string, // puede ser null si es transfer
        accountId,
        toAccountId: toAccountId as string | undefined,
        isRecurring,
        recurringFrequency: recurringFrequency as
          | "monthly"
          | "weekly"
          | "yearly"
          | undefined,
      }

      if (this.selectedItemId) {

        financesModel.updateTransaction(
          this.selectedItemId,
          transactionData
        )
        FinancesView.showNotification(
          this.container,
          "Transaction updated successfully"
        )
      } else {

        await financesModel.addTransaction(transactionData)
        FinancesView.showNotification(
          this.container,
          "Transaction added successfully"
        )
        window.addEventListener("finances:transactionsUpdated", () => {
          this.renderTransactions()
          this.renderBudgets()
        })
      }

      storageService.set(
        "finances_transactions",
        financesModel.getAllTransactions()
      )

      this.selectedItemId = null
      FinancesView.hideForm(
        this.container,
        "transactionFormContainer"
      )
      this.renderDashboard()
    })
  }

  /**
   * Edita una transacción (al hacer clic en “edit” de la tabla de transacciones).
   * Pone selectedItemId, abre el modal y carga datos.
   */
  private editTransaction(id: string): void {
    this.selectedItemId = id
    this.showTransactionForm()
  }

  /**
   * Elimina una transacción (al confirmar el diálogo).
   */
  private deleteTransaction(id: string): void {
    FinancesView.renderConfirmDialog(
      this.container,
      "Are you sure you want to delete this transaction?",
      () => {
        financesModel.deleteTransaction(id)
        FinancesView.showNotification(
          this.container,
          "Transaction deleted successfully"
        )

        storageService.set(
          "finances_transactions",
          financesModel.getAllTransactions()
        )
        this.renderDashboard()
      },
      () => {

      }
    )
  }

  /** Abre el modal para añadir/editar cuenta. */
  private showAccountForm(): void {
    let account: Account | undefined
    if (this.selectedItemId) {
      account = financesModel.getAccountById(this.selectedItemId)
    }
    FinancesView.prepareAccountForm(this.container, account)
  }

  /** Captura el “submit” de formulario de cuenta y guarda/edita en financesModel. */
  private setupAccountFormEventListeners(): void {
    const accountForm = this.container.querySelector(
      "#accountForm"
    ) as HTMLFormElement
    if (!accountForm) return

    const closeBtn = accountForm.querySelector(
      ".close-btn"
    ) as HTMLButtonElement
    closeBtn?.addEventListener("click", () => {
      this.selectedItemId = null
      FinancesView.hideForm(this.container, "accountFormContainer")
    })

    const cancelBtn = accountForm.querySelector(
      "#cancelAccountBtn"
    ) as HTMLButtonElement
    cancelBtn?.addEventListener("click", () => {
      this.selectedItemId = null
      FinancesView.hideForm(this.container, "accountFormContainer")
    })

    accountForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const name = (accountForm.querySelector(
        "#accountName"
      ) as HTMLInputElement).value
      const type = (accountForm.querySelector(
        "#accountType"
      ) as HTMLSelectElement).value as
        | "credit"
        | "debit"
        | "savings"
        | "cash"
        | "investment"
      const balance = Number.parseFloat(
        (accountForm.querySelector(
          "#accountBalance"
        ) as HTMLInputElement).value
      )
      const currency = (accountForm.querySelector(
        "#accountCurrency"
      ) as HTMLSelectElement).value
      const color = (accountForm.querySelector(
        "#accountColor"
      ) as HTMLInputElement).value
      const isDefault = (accountForm.querySelector(
        "#accountDefault"
      ) as HTMLInputElement).checked

      const accountData: Omit<Account, "id"> = {
        name,
        type,
        balance,
        currency,
        color,
        isDefault,
      }

      if (this.selectedItemId) {
        financesModel.updateAccount(this.selectedItemId, accountData)
        FinancesView.showNotification(
          this.container,
          "Account updated successfully"
        )
      } else {
        const newAccount = financesModel.addAccount(accountData)
        FinancesView.showNotification(
          this.container,
          "Account added successfully"
        )
        this.selectAccount((await newAccount).id)
      }

      this.selectedItemId = null
      FinancesView.hideForm(this.container, "accountFormContainer")

      storageService.set(
        "finances_accounts",
        financesModel.getAccounts()
      )
      this.renderDashboard()
    })
  }

  /** Abre modal para editar cuenta (al hacer clic en “edit” de la tarjeta). */
  private editAccount(id: string): void {
    this.selectedItemId = id
    this.showAccountForm()
  }

  /** Elimina una cuenta (al confirmar diálogo). */
  private deleteAccount(id: string): void {
    FinancesView.renderConfirmDialog(
      this.container,
      "Are you sure you want to delete this account? All associated transactions will also be deleted.",
      () => {
        if (this.selectedAccountId === id) {
          this.selectedAccountId = null
        }
        financesModel.deleteAccount(id)
        FinancesView.showNotification(
          this.container,
          "Account deleted successfully"
        )

        storageService.set(
          "finances_accounts",
          financesModel.getAccounts()
        )
        storageService.set(
          "finances_transactions",
          financesModel.getAllTransactions()
        )
        this.renderDashboard()
      },
      () => {

      }
    )
  }

  /** Abre modal para editar presupuestos. */
  private showBudgetForm(): void {
    const categories = financesModel.getCategoriesByType("expense")
    const budgets = financesModel.getBudgetsByMonth(
      this.currentMonth,
      this.currentYear
    )
    FinancesView.prepareBudgetForm(
      this.container,
      categories,
      budgets,
      this.currentMonth,
      this.currentYear
    )
  }

  /** Captura “submit” de presupuesto y lo guarda. */
  private setupBudgetFormEventListeners(): void {
    const budgetForm = this.container.querySelector(
      "#budgetForm"
    ) as HTMLFormElement
    if (!budgetForm) return

    const closeBtn = budgetForm.querySelector(
      ".close-btn"
    ) as HTMLButtonElement
    closeBtn?.addEventListener("click", () => {
      FinancesView.hideForm(this.container, "budgetFormContainer")
    })

    const cancelBtn = budgetForm.querySelector(
      "#cancelBudgetBtn"
    ) as HTMLButtonElement
    cancelBtn?.addEventListener("click", () => {
      FinancesView.hideForm(this.container, "budgetFormContainer")
    })

    budgetForm.addEventListener("submit", (event) => {
      event.preventDefault()

      const inputs = budgetForm.querySelectorAll(
        "input[data-category-id]"
      ) as NodeListOf<HTMLInputElement>

      inputs.forEach((input) => {
        const categoryId = input.getAttribute(
          "data-category-id"
        ) as string
        const amount = Number.parseFloat(input.value)

        if (categoryId && !isNaN(amount)) {
          financesModel.setBudget(
            categoryId,
            this.currentMonth,
            this.currentYear,
            amount
          )
          const category = financesModel.getCategoryById(categoryId)
          if (category) {
            financesModel.updateCategory(categoryId, {
              monthlyBudget: amount,
            })

            storageService.set(
              "finances_categories",
              financesModel.getCategories()
            )
          }
        }
      })

      FinancesView.showNotification(
        this.container,
        "Budgets updated successfully"
      )
      FinancesView.hideForm(
        this.container,
        "budgetFormContainer"
      )
      this.renderDashboard()
    })
  }

  /** Abre modal para añadir/editar categoría. */
  private showCategoryForm(): void {
    let category: Category | undefined
    if (this.selectedItemId) {
      category = financesModel.getCategoryById(this.selectedItemId)
    }
    FinancesView.prepareCategoryForm(this.container, category)
  }

  /** Captura “submit” de categoría y la guarda/edita. */
  private setupCategoryFormEventListeners(): void {
    const categoryForm = this.container.querySelector(
      "#categoryForm"
    ) as HTMLFormElement
    if (!categoryForm) return

    const closeBtn = categoryForm.querySelector(
      ".close-btn"
    ) as HTMLButtonElement
    closeBtn?.addEventListener("click", () => {
      this.selectedItemId = null
      FinancesView.hideForm(this.container, "categoryFormContainer")
    })

    const cancelBtn = categoryForm.querySelector(
      "#cancelCategoryBtn"
    ) as HTMLButtonElement
    cancelBtn?.addEventListener("click", () => {
      this.selectedItemId = null
      FinancesView.hideForm(this.container, "categoryFormContainer")
    })

    categoryForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const name = (categoryForm.querySelector(
        "#categoryName"
      ) as HTMLInputElement).value
      const type = (categoryForm.querySelector(
        "#categoryType"
      ) as HTMLSelectElement).value as "income" | "expense"
      const color = (categoryForm.querySelector(
        "#categoryColor"
      ) as HTMLInputElement).value
      const isFixed =
        type === "expense"
          ? (categoryForm.querySelector(
              "#categoryFixed"
            ) as HTMLInputElement).checked
          : false
      const monthlyBudget =
        type === "expense"
          ? Number.parseFloat(
              (categoryForm.querySelector(
                "#categoryBudget"
              ) as HTMLInputElement).value
            )
          : undefined

      const categoryData: Omit<Category, "id"> = {
        name,
        type,
        color,
        isFixed,
        monthlyBudget,
      }

      if (this.selectedItemId) {
        financesModel.updateCategory(
          this.selectedItemId,
          categoryData
        )
        FinancesView.showNotification(
          this.container,
          "Category updated successfully"
        )
      } else {
        await financesModel.addCategory(categoryData)
        FinancesView.showNotification(
          this.container,
          "Category added successfully"
        )
      }

      this.selectedItemId = null
      FinancesView.hideForm(
        this.container,
        "categoryFormContainer"
      )
      storageService.set(
        "finances_categories",
        financesModel.getCategories()
      )
      this.renderDashboard()
    })
      window.addEventListener("finances:categoriesUpdated", () => {
      this.populateCategoryFilter(financesModel.getCategories())
      FinancesView.renderCategories(
        this.container,
        financesModel.getCategories(),
      )
    })
  }

  /** Edita una categoría (al clicar “edit” en la lista). */
  private editCategory(id: string): void {
    this.selectedItemId = id
    this.showCategoryForm()
  }

  /** Elimina una categoría (al confirmar el diálogo). */
  private deleteCategory(id: string): void {
    FinancesView.renderConfirmDialog(
      this.container,
      "Are you sure you want to delete this category? Transactions using this category will be reassigned to 'Other'.",
      () => {
        financesModel.deleteCategory(id)
        FinancesView.showNotification(
          this.container,
          "Category deleted successfully"
        )
        storageService.set(
          "finances_categories",
          financesModel.getCategories()
        )
        storageService.set(
          "finances_transactions",
          financesModel.getAllTransactions()
        )
        this.renderDashboard()
      },
      () => {

      }
    )
  }
}

/**
 * Inicializa el controlador de finanzas: carga "components/finances.html", inyecta HTML y arranca el controller.
 */
export function initFinances(): void {
  const container = document.getElementById("content")
  if (!container) {
    throw new Error("Content container not found")
  }

  fetch("components/finances.html")
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html
      const controller = new FinancesController(container)
      controller.init()
    })
    .catch((error) => {
      console.error("Error loading finances component:", error)
      container.innerHTML = "<p>> Error loading finances component</p>"
    })
}
