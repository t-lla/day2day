/**
 * @packageDocumentation
 * @module FoldersModel
 *
 * Data model for the folders component.
 * Handles storage, retrieval, and manipulation of folder data.
 */

import type { Note } from "../../types.js"
import type { Task } from "../../types.js"
import type { Habit } from "../../types.js"
import type { Transaction } from "../../types.js"

/**
 * Represents the type of item that can be stored in a folder
 */
export type FolderItemType = "note" | "task" | "habit" | "transaction"

/**
 * Interface for items that can be stored in folders
 */
export interface FolderItem {
  id: string
  type: FolderItemType
  title: string
  description?: string
  createdAt: string
  folderIds: string[]
  originalId: string
  metadata?: {
    completed?: boolean
    completedDates?: string[]
    amount?: number
    type?: "income" | "expense" | "transfer"
  }
}

/**
 * Represents a folder in the application
 */
export interface Folder {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  itemIds: string[]
}

/**
 * Class for managing folders data
 */
export class FoldersModel {
  private folders: Folder[] = []
  private items: FolderItem[] = []

  /**
   * Initializes the folders model by loading data from localStorage
   */
  constructor() {
    this.loadData()
  }

  /**
   * Loads folder data from localStorage
   */
  private loadData(): void {
    try {
      const foldersData = localStorage.getItem("folders")
      const itemsData = localStorage.getItem("folder_items")

      this.folders = foldersData ? JSON.parse(foldersData) : []
      this.items = itemsData ? JSON.parse(itemsData) : []

      if (this.folders.length === 0) {
        this.createDefaultFolders()
      }

      this.saveData()
    } catch (error) {
      console.error("Error loading folders data:", error)
      this.folders = []
      this.items = []
      this.createDefaultFolders()
      this.saveData()
    }
  }

  /**
   * Creates default folders
   */
  private createDefaultFolders(): void {
    const now = new Date().toISOString()

    this.folders = [
      {
        id: "personal-folder",
        name: "Personal",
        description: "Personal items and goals",
        createdAt: now,
        updatedAt: now,
        itemIds: [],
      },
      {
        id: "work-folder",
        name: "Work",
        description: "Work-related items",
        createdAt: now,
        updatedAt: now,
        itemIds: [],
      },
    ]
  }

  /**
   * Saves folder data to localStorage
   */
  private saveData(): void {
    try {
      localStorage.setItem("folders", JSON.stringify(this.folders))
      localStorage.setItem("folder_items", JSON.stringify(this.items))
    } catch (error) {
      console.error("Error saving folders data:", error)
    }
  }

  /**
   * Gets all folders
   * @returns Array of folders
   */
  getFolders(): Folder[] {
    return [...this.folders]
  }

  /**
   * Gets a folder by ID
   * @param id - The folder ID
   * @returns The folder or undefined if not found
   */
  getFolderById(id: string): Folder | undefined {
    return this.folders.find((folder) => folder.id === id)
  }

  /**
   * Adds a new folder
   * @param name - The folder name
   * @param description - The folder description
   * @returns The added folder
   */
  addFolder(name: string, description: string): Folder {
    const now = new Date().toISOString()
    const id = `folder-${Date.now()}`

    const newFolder: Folder = {
      id,
      name: name.trim(),
      description: description.trim(),
      createdAt: now,
      updatedAt: now,
      itemIds: [],
    }

    this.folders.push(newFolder)
    this.saveData()
    return newFolder
  }

  /**
   * Updates an existing folder
   * @param id - The folder ID
   * @param updates - The folder updates
   * @returns The updated folder or undefined if not found
   */
  updateFolder(id: string, updates: Partial<Folder>): Folder | undefined {
    const index = this.folders.findIndex((folder) => folder.id === id)
    if (index === -1) return undefined

    const cleanUpdates = { ...updates }
    if (typeof cleanUpdates.name === "string") {
      cleanUpdates.name = cleanUpdates.name.trim()
    }
    if (typeof cleanUpdates.description === "string") {
      cleanUpdates.description = cleanUpdates.description.trim()
    }

    this.folders[index] = {
      ...this.folders[index],
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    }

    this.saveData()
    return this.folders[index]
  }

  /**
   * Deletes a folder
   * @param id - The folder ID
   * @returns True if the folder was deleted, false otherwise
   */
  deleteFolder(id: string): boolean {
    const initialLength = this.folders.length

    this.folders = this.folders.filter((folder) => folder.id !== id)

    this.items.forEach((item) => {
      item.folderIds = item.folderIds.filter((folderId) => folderId !== id)
    })

    this.items = this.items.filter((item) => item.folderIds.length > 0)

    this.saveData()
    return initialLength !== this.folders.length
  }

  /**
   * Gets all items in a folder
   * @param folderId - The folder ID
   * @returns Array of items in the folder
   */
  getItemsByFolderId(folderId: string): FolderItem[] {
    return this.items.filter((item) => item.folderIds.includes(folderId))
  }

  /**
   * Gets an item by ID
   * @param id - The item ID
   * @returns The item or undefined if not found
   */
  getItemById(id: string): FolderItem | undefined {
    return this.items.find((item) => item.id === id)
  }

  getAllFolderItems(): FolderItem[] {
    return [...this.items]
  }

  updateFolderItemMetadata(itemId: string, metadata: Partial<FolderItem["metadata"]>): boolean {
    const item = this.getItemById(itemId)
    if (!item) return false

    item.metadata = {
      ...item.metadata,
      ...metadata,
    }

    this.saveData()
    return true
  }

  /**
   * Adds a note to a folder
   * @param note - The note to add
   * @param folderId - The folder ID
   * @returns The added folder item
   */
  addNoteToFolder(note: Note, folderId: string): FolderItem | undefined {
    const folder = this.getFolderById(folderId)
    if (!folder) return undefined

    const existingItem = this.items.find(
      (item) => item.type === "note" && item.originalId === note.id && item.folderIds.includes(folderId),
    )

    if (existingItem) return existingItem

    const id = `folder-item-${Date.now()}`
    const folderItem: FolderItem = {
      id,
      type: "note",
      title: note.title,
      description: note.content.substring(0, 50) + (note.content.length > 50 ? "..." : ""),
      createdAt: note.createdAt,
      folderIds: [folderId],
      originalId: note.id,
    }

    this.items.push(folderItem)
    folder.itemIds.push(id)

    this.saveData()
    return folderItem
  }

  /**
   * Adds a task to a folder
   * @param task - The task to add
   * @param folderId - The folder ID
   * @returns The added folder item
   */
  addTaskToFolder(task: Task, folderId: string): FolderItem | undefined {
    const folder = this.getFolderById(folderId)
    if (!folder) return undefined

    const existingItem = this.items.find(
      (item) => item.type === "task" && item.originalId === task.id && item.folderIds.includes(folderId),
    )

    if (existingItem) return existingItem

    const id = `folder-item-${Date.now()}`
    const folderItem: FolderItem = {
      id,
      type: "task",
      title: task.title,
      description: task.description,
      createdAt: task.createdAt,
      folderIds: [folderId],
      originalId: task.id,
      metadata: {
        completed: task.completed,
      },
    }

    this.items.push(folderItem)
    folder.itemIds.push(id)

    this.saveData()
    return folderItem
  }

  /**
   * Adds a habit to a folder
   * @param habit - The habit to add
   * @param folderId - The folder ID
   * @returns The added folder item
   */
  addHabitToFolder(habit: Habit, folderId: string): FolderItem | undefined {
    const folder = this.getFolderById(folderId)
    if (!folder) return undefined

    const existingItem = this.items.find(
      (item) => item.type === "habit" && item.originalId === habit.id && item.folderIds.includes(folderId),
    )

    if (existingItem) return existingItem

    const id = `folder-item-${Date.now()}`
    const folderItem: FolderItem = {
      id,
      type: "habit",
      title: habit.name,
      description: habit.description,
      createdAt: habit.createdAt,
      folderIds: [folderId],
      originalId: habit.id,
      metadata: {
        completedDates: habit.completedDates,
      },
    }

    this.items.push(folderItem)
    folder.itemIds.push(id)

    this.saveData()
    return folderItem
  }

  /**
   * Adds a transaction to a folder
   * @param transaction - The transaction to add
   * @param folderId - The folder ID
   * @returns The added folder item
   */
  addTransactionToFolder(transaction: Transaction, folderId: string): FolderItem | undefined {
    const folder = this.getFolderById(folderId)
    if (!folder) return undefined

    const existingItem = this.items.find(
      (item) => item.type === "transaction" && item.originalId === transaction.id && item.folderIds.includes(folderId),
    )

    if (existingItem) return existingItem

    const id = `folder-item-${Date.now()}`
    const folderItem: FolderItem = {
      id,
      type: "transaction",
      title: transaction.description || `${transaction.type} - ${transaction.amount}`,
      description: `${transaction.type} - $${transaction.amount.toFixed(2)}`,
      createdAt: transaction.date,
      folderIds: [folderId],
      originalId: transaction.id,
      metadata: {
        amount: transaction.amount,
        type: transaction.type,
      },
    }

    this.items.push(folderItem)
    folder.itemIds.push(id)

    this.saveData()
    return folderItem
  }

  /**
   * Removes an item from a folder
   * @param itemId - The item ID
   * @param folderId - The folder ID
   * @returns True if the item was removed, false otherwise
   */
  removeItemFromFolder(itemId: string, folderId: string): boolean {
    const folder = this.getFolderById(folderId)
    const item = this.getItemById(itemId)

    if (!folder || !item) return false

    item.folderIds = item.folderIds.filter((id) => id !== folderId)

    folder.itemIds = folder.itemIds.filter((id) => id !== itemId)

    if (item.folderIds.length === 0) {
      this.items = this.items.filter((i) => i.id !== itemId)
    }

    this.saveData()
    return true
  }

  /**
   * Gets the count of items in a folder
   * @param folderId - The folder ID
   * @returns The number of items in the folder
   */
  getItemCount(folderId: string): number {
    return this.items.filter((item) => item.folderIds.includes(folderId)).length
  }
}

export const foldersModel = new FoldersModel()
