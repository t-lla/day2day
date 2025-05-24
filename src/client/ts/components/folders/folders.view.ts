/**
 * @packageDocumentation
 * @module FoldersView
 *
 * View for the folders component.
 * Renders the folders UI including folder list and folder contents.
 */

import type { Folder, FolderItem } from "./folders.model.js"
import { formatDate } from "../../router.js"

/**
 * FoldersView class for rendering folders UI components
 */
export class FoldersView {
  /**
   * Renders the main folders dashboard
   * @param container - The container element
   * @param folders - Array of folders
   * @param itemCounts - Map of folder IDs to item counts
   */
  static renderFoldersDashboard(container: HTMLElement, folders: Folder[], itemCounts: Map<string, number>): void {
    let html = `
      <div class="terminal-section folders-section">
        <div class="section-header">
          <h2>> folders</h2>
        </div>
        
        <div class="section-content">
          <h3>> your folders</h3>
          
          <div class="folders-grid">
    `

    if (folders.length === 0) {
      html += `
        <div class="empty-state">
          <p>No folders found. Create one to get started.</p>
        </div>
      `
    } else {
      folders.forEach((folder) => {
        const itemCount = itemCounts.get(folder.id) || 0
        const formattedDate = formatDate(new Date(folder.createdAt))

        html += `
          <div class="folder-card" data-id="${folder.id}">
            <div class="folder-header">
              <h4 class="folder-name">${folder.name}</h4>
              <span class="folder-date">${formattedDate}</span>
            </div>
            <div class="folder-description">${folder.description}</div>
            <div class="folder-footer">
              <span class="folder-item-count">${itemCount} item${itemCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        `
      })
    }

    html += `
          </div>
          
          <div class="folder-actions">
            <button class="action-btn" id="addFolderBtn">+ add folder</button>
          </div>
        </div>
      </div>
    `

    container.innerHTML = html
  }

  /**
   * Renders a specific folder and its contents
   * @param container - The container element
   * @param folder - The folder to render
   * @param items - Array of items in the folder
   * @param filter - Optional filter for item types
   */
  static renderFolderContents(container: HTMLElement, folder: Folder, items: FolderItem[], filter?: string): void {
    const formattedDate = formatDate(new Date(folder.createdAt))

    // Count items by type for filter badges
    const typeCounts = {
      note: items.filter((item) => item.type === "note").length,
      task: items.filter((item) => item.type === "task").length,
      habit: items.filter((item) => item.type === "habit").length,
      transaction: items.filter((item) => item.type === "transaction").length,
    }

    let html = `
      <div class="terminal-section folders-section">
        <div class="section-header">
          <h2>> folders</h2>
        </div>
        
        <div class="section-content">
          <h3>${folder.name}</h3>
          
          <div class="folder-details">
            <p>Created: ${formattedDate}</p>
            <p>${folder.description}</p>
          </div>
          
          <div class="folder-actions">
            <button class="action-btn" id="addItemBtn">add item</button>
            <button class="action-btn" id="editFolderBtn">edit folder</button>
            <button class="action-btn" id="deleteFolderBtn">delete folder</button>
            <button class="action-btn" id="backToFoldersBtn">back</button>
          </div>
          
          <div class="folder-filters">
            <span>Filter: </span>
            <button class="filter-btn ${!filter ? "active" : ""}" data-filter="all">All (${items.length})</button>
            <button class="filter-btn ${filter === "note" ? "active" : ""}" data-filter="note">Notes (${typeCounts.note})</button>
            <button class="filter-btn ${filter === "task" ? "active" : ""}" data-filter="task">Tasks (${typeCounts.task})</button>
            <button class="filter-btn ${filter === "habit" ? "active" : ""}" data-filter="habit">Habits (${typeCounts.habit})</button>
            <button class="filter-btn ${filter === "transaction" ? "active" : ""}" data-filter="transaction">Transactions (${typeCounts.transaction})</button>
          </div>
          
          <h3>> items in this folder</h3>
          
          <div class="folder-items-grid">
    `

    // Filter items if a filter is applied
    const filteredItems = filter ? items.filter((item) => item.type === filter) : items

    if (filteredItems.length === 0) {
      html += `
        <div class="empty-state">
          <p>${filter ? `No ${filter}s in this folder.` : "No items in this folder. Add some to get started."}</p>
        </div>
      `
    } else {
      filteredItems.forEach((item) => {
        const formattedItemDate = formatDate(new Date(item.createdAt))
        let itemIcon = ""
        let itemClass = ""
        let statusBadge = ""

        switch (item.type) {
          case "note":
            itemIcon = "note"
            itemClass = "note-item"
            break
          case "task":
            itemIcon = "task"
            itemClass = "task-item"
            if (item.metadata && typeof item.metadata === "object") {
              const completed = item.metadata.completed
              statusBadge = `<span class="status-badge ${completed ? "completed" : "pending"}">${completed ? "Completed" : "Pending"}</span>`
            }
            break
          case "habit":
            itemIcon = "habit"
            itemClass = "habit-item"
            if (item.metadata && typeof item.metadata === "object" && Array.isArray(item.metadata.completedDates)) {
              const today = new Date().toISOString().split("T")[0]
              const completedToday = item.metadata.completedDates.some((date: string) => date.startsWith(today))
              statusBadge = `<span class="status-badge ${completedToday ? "completed" : "pending"}">${completedToday ? "Done today" : "Not done today"}</span>`
            }
            break
          case "transaction":
            itemIcon = "transaction"
            itemClass = "transaction-item"
            if (item.metadata && typeof item.metadata === "object") {
              const amount = item.metadata.amount
              const type = item.metadata.type
              if (amount !== undefined) {
                const formattedAmount = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(amount)
                statusBadge = `<span class="status-badge ${type === "income" ? "income" : "expense"}">${formattedAmount}</span>`
              }
            }
            break
        }

        html += `
          <div class="folder-item ${itemClass}" data-id="${item.id}" data-type="${item.type}" data-original-id="${item.originalId}">
            <div class="item-header">
              <div class="item-info">
                <span class="item-icon">${itemIcon}</span><br>
                <span class="item-title">${item.title}</span>
              </div>
              <button class="remove-item-btn">✕</button>
            </div>
            ${item.description ? `<div class="item-description">${item.description}</div>` : ""}
            <div class="item-footer">
              <span class="item-date">${formattedItemDate}</span>
              ${statusBadge}
            </div>
          </div>
        `
      })
    }

    html += `
          </div>
        </div>
      </div>
    `

    container.innerHTML = html
  }

  /**
   * Renders the add folder form
   * @param container - The container element
   */
  static renderAddFolderForm(container: HTMLElement): void {
    const formContainer = document.createElement("div")
    formContainer.className = "form-overlay"
    formContainer.id = "folderFormOverlay"

    formContainer.innerHTML = `
      <div class="terminal-form">
        <h3>> add folder</h3>
        <form id="addFolderForm">
          <div class="form-row">
            <label for="folderName">name:</label>
            <input type="text" id="folderName" class="terminal-input" required>
          </div>
          <div class="form-row">
            <label for="folderDescription">description:</label>
            <input type="text" id="folderDescription" class="terminal-input" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="action-btn">save</button>
            <button type="button" id="cancelAddFolderBtn" class="action-btn">cancel</button>
          </div>
        </form>
      </div>
    `

    container.appendChild(formContainer)
  }

  /**
   * Renders the edit folder form
   * @param container - The container element
   * @param folder - The folder to edit
   */
  static renderEditFolderForm(container: HTMLElement, folder: Folder): void {
    const formContainer = document.createElement("div")
    formContainer.className = "form-overlay"
    formContainer.id = "folderFormOverlay"

    formContainer.innerHTML = `
      <div class="terminal-form">
        <h3>> edit folder</h3>
        <form id="editFolderForm" data-id="${folder.id}">
          <div class="form-row">
            <label for="folderName">name:</label>
            <input type="text" id="folderName" class="terminal-input" value="${folder.name}" required>
          </div>
          <div class="form-row">
            <label for="folderDescription">description:</label>
            <input type="text" id="folderDescription" class="terminal-input" value="${folder.description}" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="action-btn">save</button>
            <button type="button" id="cancelEditFolderBtn" class="action-btn">cancel</button>
          </div>
        </form>
      </div>
    `

    container.appendChild(formContainer)
  }

  /**
   * Renders the add item to folder form
   * @param container - The container element
   * @param folderId - The folder ID
   */
  static renderAddItemForm(container: HTMLElement, folderId: string): void {
    const existingOverlay = container.querySelector("#addItemFormOverlay")
    if (existingOverlay && existingOverlay.parentNode) {
      existingOverlay.parentNode.removeChild(existingOverlay)
    }

    const formContainer = document.createElement("div")
    formContainer.className = "form-overlay"
    formContainer.id = "addItemFormOverlay"

    formContainer.innerHTML = `
    <div class="terminal-modal">
      <div class="terminal-navbar">
        <div class="terminal-title">add item to folder</div>
        <button class="terminal-close" id="closeAddItemBtn">&times;</button>
      </div>
      <div class="terminal-content">
        <div class="terminal-sidebar">
          <ul class="terminal-tree">
            <li class="selected">└── Add Item</li>
          </ul>
        </div>
        <div class="terminal-main">
          <div class="add-item-container">
            <h3>> add item to folder</h3>
            <form id="addItemForm" class="entry-form" data-folder-id="${folderId}">
              <div class="form-group">
                <label for="itemType">item type:</label>
                <select id="itemType" class="terminal-input" required>
                  <option value="note">Note</option>
                  <option value="task">Task</option>
                  <option value="habit">Habit</option>
                  <option value="transaction">Transaction</option>
                </select>
              </div>
              <div class="form-group" id="itemSelectContainer">
                <label for="itemSelect">select item:</label>
                <select id="itemSelect" class="terminal-input" required>
                  <option value="">Loading items...</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="terminal-button">add</button>
                <button type="button" id="cancelAddItemBtn" class="terminal-button">cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `

    container.appendChild(formContainer)
  }

  /**
   * Updates the item select dropdown based on the selected item type
   * @param selectElement - The select element to update
   * @param items - Array of items to populate the dropdown with
   */
  static updateItemSelectOptions(selectElement: HTMLSelectElement, items: any[]): void {
    selectElement.innerHTML = ""

    if (!items || items.length === 0) {
      const option = document.createElement("option")
      option.value = ""
      option.textContent = "No items available"
      selectElement.appendChild(option)
      return
    }

    items.forEach((item) => {
      const option = document.createElement("option")
      option.value = item.id || ""

      if ("title" in item) {
        option.textContent = item.title || `Item ${item.id}`
      } else if ("name" in item) {
        option.textContent = item.name || `Item ${item.id}`
      } else if ("description" in item) {
        option.textContent = item.description || `Item ${item.id}`
      } else {
        option.textContent = `Item ${item.id}`
      }

      selectElement.appendChild(option)
    })
  }

  /**
   * Renders a confirmation dialog
   * @param container - The container element
   * @param message - The confirmation message
   * @param confirmCallback - Callback for confirm button
   * @param cancelCallback - Callback for cancel button
   */
  static renderConfirmDialog(
    container: HTMLElement,
    message: string,
    confirmCallback: () => void,
    cancelCallback: () => void,
  ): void {
    const dialogContainer = document.createElement("div")
    dialogContainer.className = "confirm-dialog-overlay"

    dialogContainer.innerHTML = `
      <div class="confirm-dialog">
        <p>${message}</p>
        <div class="dialog-actions">
          <button id="confirmDialogBtn" class="action-btn">confirm</button>
          <button id="cancelDialogBtn" class="action-btn">cancel</button>
        </div>
      </div>
    `

    container.appendChild(dialogContainer)

    const confirmBtn = dialogContainer.querySelector("#confirmDialogBtn")
    const cancelBtn = dialogContainer.querySelector("#cancelDialogBtn")

    confirmBtn?.addEventListener("click", () => {
      container.removeChild(dialogContainer)
      confirmCallback()
    })

    cancelBtn?.addEventListener("click", () => {
      container.removeChild(dialogContainer)
      cancelCallback()
    })
  }

  /**
   * Closes any open form overlay
   * @param container - The container element
   * @param overlayId - The ID of the overlay to close
   */
  static closeFormOverlay(container: HTMLElement, overlayId: string): void {
    const overlay = container.querySelector(`#${overlayId}`)
    if (overlay && overlay.parentNode) {
      const clone = overlay.cloneNode(true)
      overlay.parentNode.replaceChild(clone, overlay)

      clone.parentNode?.removeChild(clone)
    }
  }
}
