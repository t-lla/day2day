/**
 * @packageDocumentation
 * @module FinancesView
 *
 * View for the finances tracker component.
 * Renders the finances UI including accounts, transactions, and summaries.
 */

import type { Account, Transaction, Category, Budget, MonthlySummary } from "./finances.model.js"

/**
 * FinancesView class for rendering finances UI components
 */
export class FinancesView {
  /**
   * Renders the financial summary section
   * @param container - The container element
   * @param summary - Monthly summary
   */
  static renderFinancialSummary(container: HTMLElement, summary: MonthlySummary): void {
    const totalBalanceEl = container.querySelector("#totalBalance") as HTMLElement
    const monthlyIncomeEl = container.querySelector("#monthlyIncome") as HTMLElement
    const monthlyExpensesEl = container.querySelector("#monthlyExpenses") as HTMLElement
    const monthlyBalanceEl = container.querySelector("#monthlyBalance") as HTMLElement

    if (totalBalanceEl) {
      totalBalanceEl.textContent = `$${summary.endingBalance.toFixed(2)}`
      totalBalanceEl.className = summary.endingBalance >= 0 ? "summary-value positive" : "summary-value negative"
    }

    if (monthlyIncomeEl) {
      monthlyIncomeEl.textContent = `$${summary.totalIncome.toFixed(2)}`
      monthlyIncomeEl.className = "summary-value positive"
    }

    if (monthlyExpensesEl) {
      monthlyExpensesEl.textContent = `$${summary.totalExpenses.toFixed(2)}`
      monthlyExpensesEl.className = "summary-value negative"
    }

    if (monthlyBalanceEl) {
      monthlyBalanceEl.textContent = `$${summary.savedAmount.toFixed(2)}`
      monthlyBalanceEl.className = summary.savedAmount >= 0 ? "summary-value positive" : "summary-value negative"
    }
  }

  /**
   * Renders the accounts overview section
   * @param container - The container element
   * @param accounts - Array of accounts
   * @param selectedAccountId - Currently selected account ID
   */
  static renderAccountsOverview(container: HTMLElement, accounts: Account[], selectedAccountId: string | null): void {
    const accountsOverview = container.querySelector("#accountsOverview") as HTMLElement
    if (!accountsOverview) return

    let html = ""

    html += `
    <div class="account-card ${!selectedAccountId || selectedAccountId === "all" ? "selected" : ""}" data-id="all">
      <div class="account-header" style="background-color: #40e07d">
        <div class="account-name">All Accounts</div>
        <div class="account-type">overview</div>
      </div>
      <div class="account-balance">
        <span class="balance-label">Total Balance:</span>
        <span class="balance-value ${accounts.reduce((sum, acc) => sum + acc.balance, 0) >= 0 ? "positive" : "negative"}">
          $${accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)}
        </span>
      </div>
    </div>
  `

    accounts.forEach((account) => {
      html += `
        <div class="account-card ${selectedAccountId === account.id ? "selected" : ""}" data-id="${account.id}">
          <div class="account-header" style="background-color: ${account.color}">
            <div class="account-name">${account.name}</div>
            <div class="account-type">${account.type}</div>
          </div>
          <div class="account-balance">
            <span class="balance-label">Balance:</span>
            <span class="balance-value ${account.balance >= 0 ? "positive" : "negative"}">
              ${account.currency} ${account.balance.toFixed(2)}
            </span>
          </div>
          <div class="account-actions">
            <button class="action-btn edit-account-btn">edit</button>
            <button class="action-btn delete-account-btn">delete</button>
          </div>
        </div>
      `
    })

    html += `
      <div class="account-card add-account-card">
        <div class="add-account-icon">+</div>
        <div class="add-account-text">Add Account</div>
      </div>
    `

    accountsOverview.innerHTML = html
  }

  /**
   * Renders the transactions list
   * @param container - The container element
   * @param transactions - Array of transactions
   * @param categories - Array of categories
   */
  static renderTransactions(container: HTMLElement, transactions: Transaction[], categories: Category[]): void {
    const transactionsBody = container.querySelector("#transactionsBody") as HTMLElement
    if (!transactionsBody) return

    if (transactions.length === 0) {
      transactionsBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">No transactions found. Add one to get started.</td>
        </tr>
      `
      return
    }

    transactionsBody.innerHTML = transactions
      .map((transaction) => {
        const category = categories.find((c) => c.id === transaction.categoryId)
        const formattedDate = new Date(transaction.date).toLocaleDateString()
        const isIncome = transaction.type === "income"
        const isTransfer = transaction.type === "transfer"

        return `
          <tr data-id="${transaction.id}">
            <td>${formattedDate}</td>
            <td>${transaction.description || "??"}</td>
            <td>${isTransfer ? "Transfer" : category?.name || "Uncategorized"}</td>
            <td class="${isIncome ? "positive" : "negative"}">${isIncome ? "+" : "-"}$${transaction.amount.toFixed(2)}</td>
            <td>
              <button class="action-btn edit-transaction-btn">edit</button>
              <button class="action-btn delete-transaction-btn">delete</button>
            </td>
          </tr>
        `
      })
      .join("")
  }

  /**
   * Renders the budgets section
   * @param container - The container element
   * @param categories - Array of categories
   * @param summary - Monthly summary
   */
  static renderBudgets(container: HTMLElement, categories: Category[], summary: MonthlySummary): void {
    const budgetsList = container.querySelector("#budgetsList") as HTMLElement
    if (!budgetsList) return

    const expenseCategories = categories.filter((c) => c.type === "expense")

    if (expenseCategories.length === 0) {
      budgetsList.innerHTML = `<div class="empty-state">No expense categories found. Add categories first.</div>`
      return
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    budgetsList.innerHTML = `
      <div class="budget-categories">
        <h4>> expense categories for ${monthNames[summary.month]} ${summary.year}</h4>
        <div class="category-list">
          ${expenseCategories
            .map((category) => {
              const spent = summary.categoryTotals[category.id] || 0
              const budget = category.monthlyBudget || 0
              const percentage = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0

              return `
                <div class="category-item" data-id="${category.id}">
                  <div class="category-header">
                    <span class="category-name">${category.name}</span>
                    <span class="category-amount">$${spent.toFixed(2)} / $${budget.toFixed(2)}</span>
                  </div>
                  <div class="budget-progress">
                    <div class="budget-bar" style="width: ${percentage}%; background-color: ${percentage > 90 ? "#ff6b6b" : "#40e07d"}"></div>
                  </div>
                </div>
              `
            })
            .join("")}
        </div>
      </div>
      
      <div class="budget-summary">
        <h4>> monthly overview</h4>
        <div class="budget-stats">
          <div class="budget-stat">
            <span class="stat-label">Total Budget:</span>
            <span class="stat-value">$${expenseCategories
              .reduce((sum, c) => sum + (c.monthlyBudget || 0), 0)
              .toFixed(2)}</span>
          </div>
          <div class="budget-stat">
            <span class="stat-label">Total Spent:</span>
            <span class="stat-value">$${summary.totalExpenses.toFixed(2)}</span>
          </div>
          <div class="budget-stat">
            <span class="stat-label">Remaining:</span>
            <span class="stat-value ${summary.savedAmount >= 0 ? "positive" : "negative"}">$${summary.savedAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Renders the categories section
   * @param container - The container element
   * @param categories - Array of categories
   */
  static renderCategories(container: HTMLElement, categories: Category[]): void {
    const incomeCategories = container.querySelector("#incomeCategories") as HTMLElement
    const expenseCategories = container.querySelector("#expenseCategories") as HTMLElement

    if (!incomeCategories || !expenseCategories) return

    const incomeItems = categories.filter((c) => c.type === "income")
    const expenseItems = categories.filter((c) => c.type === "expense")

    if (incomeItems.length === 0) {
      incomeCategories.innerHTML = `<div class="empty-state">No income categories found. Add one to get started.</div>`
    } else {
      incomeCategories.innerHTML = incomeItems
        .map(
          (category) => `
          <div class="category-card" data-id="${category.id}">
            <div class="category-info">
              <div class="category-color" style="background-color: ${category.color}"></div>
              <div class="category-name">${category.name}</div>
            </div>
            <div class="category-actions">
              <button class="action-btn edit-category-btn">edit</button>
              <button class="action-btn delete-category-btn">delete</button>
            </div>
          </div>
        `,
        )
        .join("")
    }

    if (expenseItems.length === 0) {
      expenseCategories.innerHTML = `<div class="empty-state">No expense categories found. Add one to get started.</div>`
    } else {
      expenseCategories.innerHTML = expenseItems
        .map(
          (category) => `
          <div class="category-card" data-id="${category.id}">
            <div class="category-info">
              <div class="category-color" style="background-color: ${category.color}"></div>
              <div class="category-name">${category.name}</div>
              ${category.isFixed ? '<div class="category-fixed">(fixed)</div>' : ""}
            </div>
            <div class="category-actions">
              <button class="action-btn edit-category-btn">edit</button>
              <button class="action-btn delete-category-btn">delete</button>
            </div>
          </div>
        `,
        )
        .join("")
    }
  }

  /**
   * Prepares the transaction form
   * @param container - The container element
   * @param accounts - Array of accounts
   * @param categories - Array of categories
   * @param transaction - Transaction to edit (optional)
   * @param preSelectedAccountId - Pre-selected account ID (optional)
   */
  static prepareTransactionForm(
    container: HTMLElement,
    accounts: Account[],
    categories: Category[],
    transaction?: Transaction,
    preSelectedAccountId?: string | null,
  ): void {
    const formContainer = container.querySelector("#transactionFormContainer") as HTMLElement
    if (!formContainer) return

    const transactionForm = container.querySelector("#transactionForm") as HTMLFormElement
    if (!transactionForm) return

    const isEdit = !!transaction
    const today = new Date().toISOString().split("T")[0]

    const formTitle = formContainer.querySelector("h3") as HTMLElement
    if (formTitle) {
      formTitle.textContent = `> ${isEdit ? "edit" : "add"} transaction`
    }

    const typeSelect = transactionForm.querySelector("#transactionType") as HTMLSelectElement
    const dateInput = transactionForm.querySelector("#transactionDate") as HTMLInputElement
    const amountInput = transactionForm.querySelector("#transactionAmount") as HTMLInputElement
    const descriptionInput = transactionForm.querySelector("#transactionDescription") as HTMLInputElement
    const accountSelect = transactionForm.querySelector("#transactionAccount") as HTMLSelectElement
    const toAccountSelect = transactionForm.querySelector("#transactionToAccount") as HTMLSelectElement
    const categorySelect = transactionForm.querySelector("#transactionCategory") as HTMLSelectElement
    const recurringCheckbox = transactionForm.querySelector("#transactionRecurring") as HTMLInputElement
    const recurringFrequencySelect = transactionForm.querySelector("#recurringFrequency") as HTMLSelectElement

    if (isEdit && transaction) {
      typeSelect.value = transaction.type
      dateInput.value = transaction.date.split("T")[0]
      amountInput.value = transaction.amount.toString()
      descriptionInput.value = transaction.description
      recurringCheckbox.checked = transaction.isRecurring || false

      if (transaction.recurringFrequency) {
        recurringFrequencySelect.value = transaction.recurringFrequency
      }

      const toAccountGroup = transactionForm.querySelector("#toAccountGroup") as HTMLElement
      const categoryGroup = transactionForm.querySelector("#categoryGroup") as HTMLElement
      const recurringFrequencyGroup = transactionForm.querySelector("#recurringFrequencyGroup") as HTMLElement

      toAccountGroup.style.display = transaction.type === "transfer" ? "flex" : "none"
      categoryGroup.style.display = transaction.type !== "transfer" ? "flex" : "none"
      recurringFrequencyGroup.style.display = transaction.isRecurring ? "flex" : "none"
    } else {

      dateInput.value = today
      amountInput.value = ""
      descriptionInput.value = ""
      recurringCheckbox.checked = false

      const recurringFrequencyGroup = transactionForm.querySelector("#recurringFrequencyGroup") as HTMLElement
      recurringFrequencyGroup.style.display = "none"
    }

    accountSelect.innerHTML = accounts
      .map(
        (account) => `
        <option value="${account.id}" ${
          (transaction?.accountId === account.id) || (!transaction && preSelectedAccountId === account.id)
            ? "selected"
            : ""
        }>
          ${account.name}
        </option>
      `,
      )
      .join("")

    toAccountSelect.innerHTML = accounts
      .map(
        (account) => `
        <option value="${account.id}" ${transaction?.toAccountId === account.id ? "selected" : ""}>
          ${account.name}
        </option>
      `,
      )
      .join("")

    const incomeCategories = categories.filter((c) => c.type === "income")
    const expenseCategories = categories.filter((c) => c.type === "expense")

    categorySelect.innerHTML = `
      <optgroup label="Income Categories" id="incomeCategoriesGroup" ${transaction?.type !== "income" && typeSelect.value !== "income" ? 'style="display: none;"' : ""}>
        ${incomeCategories
          .map(
            (category) => `
          <option value="${category.id}" ${transaction?.categoryId === category.id ? "selected" : ""}>
            ${category.name}
          </option>
        `,
          )
          .join("")}
      </optgroup>
      <optgroup label="Expense Categories" id="expenseCategoriesGroup" ${transaction?.type !== "expense" && typeSelect.value !== "expense" ? 'style="display: none;"' : ""}>
        ${expenseCategories
          .map(
            (category) => `
          <option value="${category.id}" ${transaction?.categoryId === category.id ? "selected" : ""}>
            ${category.name}
          </option>
        `,
          )
          .join("")}
      </optgroup>
    `

    if (transaction?.categoryId) {
      categorySelect.value = transaction.categoryId
    } else {

      const defaultCategory = typeSelect.value === "income" ? incomeCategories[0]?.id : expenseCategories[0]?.id

      if (defaultCategory) {
        categorySelect.value = defaultCategory
      }
    }

    formContainer.classList.remove("hidden")
  }

  /**
   * Prepares the account form
   * @param container - The container element
   * @param account - Account to edit (optional)
   */
  static prepareAccountForm(container: HTMLElement, account?: Account): void {
    const formContainer = container.querySelector("#accountFormContainer") as HTMLElement
    if (!formContainer) return

    const accountForm = container.querySelector("#accountForm") as HTMLFormElement
    if (!accountForm) return

    const isEdit = !!account

    const formTitle = container.querySelector("#accountFormTitle") as HTMLElement
    if (formTitle) {
      formTitle.textContent = `> ${isEdit ? "edit" : "add"} account`
    }

    const nameInput = accountForm.querySelector("#accountName") as HTMLInputElement
    const typeSelect = accountForm.querySelector("#accountType") as HTMLSelectElement
    const balanceInput = accountForm.querySelector("#accountBalance") as HTMLInputElement
    const currencySelect = accountForm.querySelector("#accountCurrency") as HTMLSelectElement
    const colorInput = accountForm.querySelector("#accountColor") as HTMLInputElement
    const defaultCheckbox = accountForm.querySelector("#accountDefault") as HTMLInputElement

    if (isEdit && account) {
      nameInput.value = account.name
      typeSelect.value = account.type
      balanceInput.value = account.balance.toString()
      balanceInput.disabled = true // Can't edit balance directly
      currencySelect.value = account.currency
      colorInput.value = account.color || "#40e07d"
      defaultCheckbox.checked = account.isDefault || false
    } else {

      nameInput.value = ""
      balanceInput.value = "0.00"
      balanceInput.disabled = false
      colorInput.value = "#40e07d"
      defaultCheckbox.checked = false
    }

    formContainer.classList.remove("hidden")
  }

  /**
   * Prepares the budget form
   * @param container - The container element
   * @param categories - Array of expense categories
   * @param budgets - Array of existing budgets
   * @param month - Current month (0-11)
   * @param year - Current year
   */
  static prepareBudgetForm(
    container: HTMLElement,
    categories: Category[],
    budgets: Budget[],
    month: number,
    year: number,
  ): void {
    const formContainer = container.querySelector("#budgetFormContainer") as HTMLElement
    if (!formContainer) return

    const budgetForm = container.querySelector("#budgetForm") as HTMLFormElement
    if (!budgetForm) return

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const formTitle = formContainer.querySelector("h3") as HTMLElement
    if (formTitle) {
      formTitle.textContent = `> edit budgets for ${monthNames[month]} ${year}`
    }

    const expenseCategories = categories.filter((c) => c.type === "expense")
    const budgetFields = budgetForm.querySelector("#budgetFormFields") as HTMLElement

    if (budgetFields) {
      budgetFields.innerHTML = expenseCategories
        .map((category) => {
          const budget = budgets.find((b) => b.categoryId === category.id && b.month === month && b.year === year)

          return `
          <div class="form-row">
            <label for="budget_${category.id}">${category.name}:</label>
            <input type="number" id="budget_${category.id}" 
                   class="terminal-input"
                   data-category-id="${category.id}"
                   step="0.01" min="0" 
                   value="${budget?.amount || category.monthlyBudget || "0.00"}">
          </div>
        `
        })
        .join("")
    }

    formContainer.classList.remove("hidden")
  }

  /**
   * Prepares the category form
   * @param container - The container element
   * @param category - Category to edit (optional)
   */
  static prepareCategoryForm(container: HTMLElement, category?: Category): void {
    const formContainer = container.querySelector("#categoryFormContainer") as HTMLElement
    if (!formContainer) return

    const categoryForm = container.querySelector("#categoryForm") as HTMLFormElement
    if (!categoryForm) return

    const isEdit = !!category

    const formTitle = container.querySelector("#categoryFormTitle") as HTMLElement
    if (formTitle) {
      formTitle.textContent = `> ${isEdit ? "edit" : "add"} category`
    }

    const nameInput = categoryForm.querySelector("#categoryName") as HTMLInputElement
    const typeSelect = categoryForm.querySelector("#categoryType") as HTMLSelectElement
    const colorInput = categoryForm.querySelector("#categoryColor") as HTMLInputElement
    const fixedCheckbox = categoryForm.querySelector("#categoryFixed") as HTMLInputElement
    const budgetInput = categoryForm.querySelector("#categoryBudget") as HTMLInputElement
    const fixedExpenseGroup = categoryForm.querySelector("#fixedExpenseGroup") as HTMLElement
    const monthlyBudgetGroup = categoryForm.querySelector("#monthlyBudgetGroup") as HTMLElement

    if (isEdit && category) {
      nameInput.value = category.name
      typeSelect.value = category.type
      typeSelect.disabled = true // Can't change type after creation
      colorInput.value = category.color || "#40e07d"
      fixedCheckbox.checked = category.isFixed || false
      budgetInput.value = category.monthlyBudget?.toString() || "0.00"

      fixedExpenseGroup.style.display = category.type === "expense" ? "flex" : "none"
      monthlyBudgetGroup.style.display = category.type === "expense" ? "flex" : "none"
    } else {

      nameInput.value = ""
      typeSelect.disabled = false
      colorInput.value = typeSelect.value === "income" ? "#40e07d" : "#ff6b6b"
      fixedCheckbox.checked = false
      budgetInput.value = "0.00"

      const updateVisibility = () => {
        const isExpense = typeSelect.value === "expense"
        fixedExpenseGroup.style.display = isExpense ? "flex" : "none"
        monthlyBudgetGroup.style.display = isExpense ? "flex" : "none"
      }

      updateVisibility()
      typeSelect.addEventListener("change", () => {
        updateVisibility()
        colorInput.value = typeSelect.value === "income" ? "#40e07d" : "#ff6b6b"
      })
    }

    formContainer.classList.remove("hidden")
  }

  /**
   * Renders a confirmation dialog
   * @param container - The container element
   * @param message - The confirmation message
   * @param onConfirm - Callback for confirm button
   * @param onCancel - Callback for cancel button
   */
  static renderConfirmDialog(
    container: HTMLElement,
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
  ): void {
    const dialog = document.createElement("div")
    dialog.className = "confirm-dialog-overlay"

    dialog.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-message">${message}</div>
        <div class="confirm-actions">
          <button class="action-btn confirm-btn">confirm</button>
          <button class="action-btn cancel-btn">cancel</button>
        </div>
      </div>
    `

    container.appendChild(dialog)

    const confirmBtn = dialog.querySelector(".confirm-btn") as HTMLButtonElement
    const cancelBtn = dialog.querySelector(".cancel-btn") as HTMLButtonElement

    confirmBtn?.addEventListener("click", () => {
      container.removeChild(dialog)
      onConfirm()
    })

    cancelBtn?.addEventListener("click", () => {
      container.removeChild(dialog)
      onCancel()
    })
  }

  /**
   * Shows a notification message
   * @param container - The container element
   * @param message - The notification message
   * @param type - The notification type ('success' or 'error')
   */
  static showNotification(container: HTMLElement, message: string, type: "success" | "error" = "success"): void {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    container.appendChild(notification)

    setTimeout(() => {
      if (container.contains(notification)) {
        container.removeChild(notification)
      }
    }, 3000)
  }

  /**
   * Hides a form container
   * @param container - The container element
   * @param formId - The ID of the form container to hide
   */
  static hideForm(container: HTMLElement, formId: string): void {
    const formContainer = container.querySelector(`#${formId}`) as HTMLElement
    if (formContainer) {
      formContainer.classList.add("hidden")
    }
  }
}
