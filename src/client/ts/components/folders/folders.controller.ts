/**
 * @packageDocumentation
 * @module FoldersController
 *
 * Controller for the folders component.
 * Manages the interaction between the folders model and view.
 */

import { FoldersView } from "./folders.view.js"
import { foldersModel, type FolderItemType, type FolderItem } from "./folders.model.js"
import { loadSection } from "../../router.js"
import { loadComponent } from "../loader.js"

import { getAllHabits, findHabitById } from "../habits/habits.model.js"
import { financesModel } from "../finances/finances.model.js"

/**
 * FoldersController class for managing folders functionality
 */
export class FoldersController {
  private container: HTMLElement
  private currentFolderId: string | null = null
  private currentFilter: string | null = null

  /**
   * Creates a new instance of FoldersController
   * @param container - The container element
   */
  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Initializes the controller and renders the initial view
   */
  async init(): Promise<void> {
    await this.renderFoldersDashboard()
    this.setupEventListeners()
    this.initStatusUpdateListeners()
  }

  /**
   * Sets up event listeners for the folders component
   */
  private setupEventListeners(): void {
    this.container.addEventListener("click", (event) => {
      const target = event.target as HTMLElement

      if (target.closest(".folder-card")) {
        const folderCard = target.closest(".folder-card") as HTMLElement
        const folderId = folderCard.dataset.id
        if (folderId) {
          this.openFolder(folderId)
        }
      }

      else if (target.closest(".filter-btn")) {
        const filterBtn = target.closest(".filter-btn") as HTMLElement
        const filter = filterBtn.dataset.filter

        if (filter) {
          this.applyFilter(filter === "all" ? null : filter)
        }
      }

      else if (target.id === "addFolderBtn" || target.closest("#addFolderBtn")) {
        this.showAddFolderForm()
      }

      else if (target.id === "backToFoldersBtn" || target.closest("#backToFoldersBtn")) {
        this.renderFoldersDashboard()
      }

      else if (target.id === "editFolderBtn" || target.closest("#editFolderBtn")) {
        if (this.currentFolderId) {
          this.showEditFolderForm(this.currentFolderId)
        }
      }

      else if (target.id === "deleteFolderBtn" || target.closest("#deleteFolderBtn")) {
        if (this.currentFolderId) {
          this.confirmDeleteFolder(this.currentFolderId)
        }
      }

      else if (target.id === "addItemBtn" || target.closest("#addItemBtn")) {
        if (this.currentFolderId) {
          this.showAddItemForm(this.currentFolderId)
        }
      }

      else if (target.closest(".folder-item") && !target.closest(".remove-item-btn")) {
        const folderItem = target.closest(".folder-item") as HTMLElement
        const itemId = folderItem.dataset.id
        const itemType = folderItem.dataset.type as FolderItemType
        const originalId = folderItem.dataset.originalId

        if (itemId && itemType && originalId) {
          this.navigateToItem(itemType, originalId)
        }
      }

      else if (target.closest(".remove-item-btn")) {
        const folderItem = target.closest(".folder-item") as HTMLElement
        const itemId = folderItem.dataset.id

        if (itemId && this.currentFolderId) {
          this.removeItemFromFolder(itemId, this.currentFolderId)
        }
      }

      else if (target.id === "cancelAddFolderBtn") {
        FoldersView.closeFormOverlay(this.container, "folderFormOverlay")
      }

      else if (target.id === "cancelEditFolderBtn") {
        FoldersView.closeFormOverlay(this.container, "folderFormOverlay")
      }

      else if (target.id === "cancelAddItemBtn" || target.id === "closeAddItemBtn") {
        FoldersView.closeFormOverlay(this.container, "addItemFormOverlay")
      }
    })

    this.container.addEventListener("submit", (event) => {
      event.preventDefault()
      const target = event.target as HTMLFormElement

      if (target.id === "addFolderForm") {
        const nameInput = document.getElementById("folderName") as HTMLInputElement
        const descriptionInput = document.getElementById("folderDescription") as HTMLInputElement

        if (nameInput && descriptionInput && nameInput.value.trim() && descriptionInput.value.trim()) {
          this.addFolder(nameInput.value.trim(), descriptionInput.value.trim())
        }
      }

      else if (target.id === "editFolderForm") {
        const folderId = target.dataset.id
        const nameInput = document.getElementById("folderName") as HTMLInputElement
        const descriptionInput = document.getElementById("folderDescription") as HTMLInputElement

        if (folderId && nameInput && descriptionInput && nameInput.value.trim() && descriptionInput.value.trim()) {
          this.updateFolder(folderId, nameInput.value.trim(), descriptionInput.value.trim())
        }
      }

      else if (target.id === "addItemForm") {
        const folderId = target.dataset.folderId
        const typeSelect = document.getElementById("itemType") as HTMLSelectElement
        const itemSelect = document.getElementById("itemSelect") as HTMLSelectElement

        if (folderId && typeSelect && itemSelect && itemSelect.value) {
          this.addItemToFolder(typeSelect.value as FolderItemType, itemSelect.value, folderId)
        }
      }
    })

    this.container.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement

      if (target.id === "itemType") {
        const itemType = target.value as FolderItemType
        const itemSelect = document.getElementById("itemSelect") as HTMLSelectElement

        if (itemSelect) {
          itemSelect.innerHTML = '<option value="">Loading items...</option>'

          setTimeout(() => {
            this.loadItemsForType(itemType, itemSelect)
          }, 50)
        }
      }
    })
  }

  /**
   * Applies a filter to the folder items
   * @param filter - The filter to apply, or null to show all items
   */
  private applyFilter(filter: string | null): void {
    this.currentFilter = filter

    if (this.currentFolderId) {
      this.openFolder(this.currentFolderId)
    }
  }

  /**
   * Renders the folders dashboard
   */
  private async renderFoldersDashboard(): Promise<void> {
    const folders = foldersModel.getFolders()
    const itemCounts = new Map<string, number>()

    folders.forEach((folder) => {
      itemCounts.set(folder.id, foldersModel.getItemCount(folder.id))
    })

    FoldersView.renderFoldersDashboard(this.container, folders, itemCounts)
    this.currentFolderId = null
    this.currentFilter = null
  }

  /**
   * Opens a folder and displays its contents
   * @param folderId - The ID of the folder to open
   */
  private openFolder(folderId: string): void {
    const folder = foldersModel.getFolderById(folderId)
    if (!folder) return

    const items = this.enrichFolderItems(foldersModel.getItemsByFolderId(folderId))
    FoldersView.renderFolderContents(this.container, folder, items, this.currentFilter || undefined)
    this.currentFolderId = folderId
  }

  /**
   * Enriches folder items with additional metadata
   * @param items - The folder items to enrich
   * @returns Enriched folder items
   */
  private enrichFolderItems(items: FolderItem[]): FolderItem[] {
    return items.map((item) => {
      const enrichedItem = { ...item }

      switch (item.type) {
        case "task": {
          if (!enrichedItem.metadata || enrichedItem.metadata.completed === undefined) {
            const savedTasks = localStorage.getItem("tasks")
            if (savedTasks) {
              const tasks = JSON.parse(savedTasks)
              const task = tasks.find((t: any) => t.id === item.originalId)
              if (task) {
                enrichedItem.metadata = { ...enrichedItem.metadata, completed: task.completed }
              }
            }
          }
          break
        }
        case "habit": {
          if (!enrichedItem.metadata || !enrichedItem.metadata.completedDates) {
            const habit = findHabitById(item.originalId)
            if (habit) {
              enrichedItem.metadata = { ...enrichedItem.metadata, completedDates: habit.completedDates }
            }
          }
          break
        }
        case "transaction": {
          if (!enrichedItem.metadata || enrichedItem.metadata.amount === undefined) {
            const transaction = financesModel.getTransactionById(item.originalId)
            if (transaction) {
              enrichedItem.metadata = {
                ...enrichedItem.metadata,
                amount: transaction.amount,
                type: transaction.type,
              }
            }
          }
          break
        }
      }

      return enrichedItem
    })
  }

  /**
   * Shows the add folder form
   */
  private showAddFolderForm(): void {
    FoldersView.renderAddFolderForm(this.container)
  }

  /**
   * Shows the edit folder form
   * @param folderId - The ID of the folder to edit
   */
  private showEditFolderForm(folderId: string): void {
    const folder = foldersModel.getFolderById(folderId)
    if (!folder) return

    FoldersView.renderEditFolderForm(this.container, folder)
  }

  /**
   * Shows the add item form
   * @param folderId - The ID of the folder to add an item to
   */
  private showAddItemForm(folderId: string): void {
    FoldersView.closeFormOverlay(this.container, "addItemFormOverlay")

    FoldersView.renderAddItemForm(this.container, folderId)

    setTimeout(() => {
      const itemSelect = document.getElementById("itemSelect") as HTMLSelectElement
      const itemType = document.getElementById("itemType") as HTMLSelectElement

      if (itemSelect && itemType) {
        this.loadItemsForType(itemType.value as FolderItemType, itemSelect)
      }
    }, 100)
  }

  /**
   * Loads items for a specific type into the select dropdown
   * @param itemType - The type of items to load
   * @param selectElement - The select element to populate
   */
  private loadItemsForType(itemType: FolderItemType, selectElement: HTMLSelectElement): void {
    selectElement.innerHTML = '<option value="">Loading items...</option>'
    selectElement.disabled = true

    let items: any[] = []

    try {
      switch (itemType) { //access from localStorage
        case "note": {
          const savedNotes = localStorage.getItem("notes")
          if (savedNotes) {
            items = JSON.parse(savedNotes)
          }
          break
        }
        case "task": {
          const savedTasks = localStorage.getItem("tasks")
          if (savedTasks) {
            items = JSON.parse(savedTasks)
          }
          break
        }
        case "habit": {
          items = getAllHabits()
          break
        }
        case "transaction": {
          items = financesModel.getAllTransactions()
          break
        }
      }

      FoldersView.updateItemSelectOptions(selectElement, items)
    } catch (error) {
      console.error(`Error loading items for type ${itemType}:`, error)
      selectElement.innerHTML = '<option value="">Error loading items</option>'
    } finally {
      selectElement.disabled = false
    }
  }

  /**
   * Adds a new folder
   * @param name - The name of the folder
   * @param description - The description of the folder
   */
  private addFolder(name: string, description: string): void {
    foldersModel.addFolder(name, description)
    FoldersView.closeFormOverlay(this.container, "folderFormOverlay")
    this.renderFoldersDashboard()
  }

  /**
   * Updates an existing folder
   * @param folderId - The ID of the folder to update
   * @param name - The new name of the folder
   * @param description - The new description of the folder
   */
  private updateFolder(folderId: string, name: string, description: string): void {
    foldersModel.updateFolder(folderId, { name, description })
    FoldersView.closeFormOverlay(this.container, "folderFormOverlay")
    this.openFolder(folderId)
  }

  /**
   * Shows a confirmation dialog for deleting a folder
   * @param folderId - The ID of the folder to delete
   */
  private confirmDeleteFolder(folderId: string): void {
    FoldersView.renderConfirmDialog(
      this.container,
      "Are you sure you want to delete this folder? All items will be removed from the folder.",
      () => {
        this.deleteFolder(folderId)
      },
      () => { //do nothing on cancel
      },
    )
  }

  /**
   * Deletes a folder
   * @param folderId - The ID of the folder to delete
   */
  private deleteFolder(folderId: string): void {
    foldersModel.deleteFolder(folderId)
    this.renderFoldersDashboard()
  }

  /**
   * Adds an item to a folder
   * @param itemType - The type of the item
   * @param itemId - The ID of the item
   * @param folderId - The ID of the folder
   */
  private addItemToFolder(itemType: FolderItemType, itemId: string, folderId: string): void {
    let added = false

    switch (itemType) {
      case "note": {
        const savedNotes = localStorage.getItem("notes")
        if (savedNotes) {
          const notes = JSON.parse(savedNotes)
          const note = notes.find((n: any) => n.id === itemId)
          if (note) {
            foldersModel.addNoteToFolder(note, folderId)
            added = true
          }
        }
        break
      }
      case "task": {
        const savedTasks = localStorage.getItem("tasks")
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks)
          const task = tasks.find((t: any) => t.id === itemId)
          if (task) {
            foldersModel.addTaskToFolder(task, folderId)
            added = true
          }
        }
        break
      }
      case "habit": {
        const habit = findHabitById(itemId)
        if (habit) {
          foldersModel.addHabitToFolder(habit, folderId)
          added = true
        }
        break
      }
      case "transaction": {
        const transaction = financesModel.getTransactionById(itemId)
        if (transaction) {
          foldersModel.addTransactionToFolder(transaction, folderId)
          added = true
        }
        break
      }
    }

    if (added) {
      FoldersView.closeFormOverlay(this.container, "addItemFormOverlay")
      this.openFolder(folderId)
    }
  }

  /**
   * Removes an item from a folder
   * @param itemId - The ID of the item
   * @param folderId - The ID of the folder
   */
  private removeItemFromFolder(itemId: string, folderId: string): void {
    foldersModel.removeItemFromFolder(itemId, folderId)
    this.openFolder(folderId)
  }

  /**
   * Navigates to the original item in its respective section
   * @param itemType - The type of the item
   * @param originalId - The original ID of the item
   */
  private navigateToItem(itemType: FolderItemType, originalId: string): void {
    sessionStorage.setItem("openItemId", originalId)

    switch (itemType) {
      case "note":
        loadSection("notes")
        break
      case "task":
        loadSection("tasks")
        break
      case "habit":
        loadSection("habits")
        break
      case "transaction":
        loadSection("finances")
        break
    }
  }

  private initStatusUpdateListeners(): void {
    document.addEventListener("taskStatusChanged", (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail && customEvent.detail.taskId) {
        this.updateFolderItemStatus("task", customEvent.detail.taskId)
      }
    })

    document.addEventListener("habitCompletionChanged", (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail && customEvent.detail.habitId) {
        this.updateFolderItemStatus("habit", customEvent.detail.habitId)
      }
    })
  }

  private updateFolderItemStatus(itemType: FolderItemType, originalId: string): void {
    const items = foldersModel
      .getAllFolderItems()
      .filter((item) => item.type === itemType && item.originalId === originalId)

    if (items.length === 0) return

    items.forEach((item) => {
      switch (itemType) {
        case "task": {
          const savedTasks = localStorage.getItem("tasks")
          if (savedTasks) {
            const tasks = JSON.parse(savedTasks)
            const task = tasks.find((t: any) => t.id === originalId)
            if (task) {
              foldersModel.updateFolderItemMetadata(item.id, {
                completed: task.completed,
              })
            }
          }
          break
        }
        case "habit":
          {
            const habit = findHabitById(originalId)
            if (habit) {
              foldersModel.updateFolderItemMetadata(item.id, {
                completedDates: habit.completedDates,
              })
            }
          }
          break
      }
    })


    if (this.currentFolderId && this.container.querySelector(".folders-section")) {
      const folderItems = foldersModel.getItemsByFolderId(this.currentFolderId)
      const needsRefresh = folderItems.some((item) => item.type === itemType && item.originalId === originalId)

      if (needsRefresh) {
        this.openFolder(this.currentFolderId)
      }
    }
  }
}

/**
 * Initializes the folders controller
 */
export async function initFolders(): Promise<void> {
  const content = document.getElementById("content")
  if (!content) {
    throw new Error("Content container not found")
  }

  try {
    await loadComponent("#content", "components/folders.html")

    const controller = new FoldersController(content)
    await controller.init()
  } catch (error) {
    console.error("Error loading folders component:", error)
    content.innerHTML = "<p>> Error loading folders component</p>"
  }
}
