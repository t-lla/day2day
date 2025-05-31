/**
 * @packageDocumentation
 * @module SyncStatusController
 *
 * Displays sync status and connection information in the navbar.
 */

import { syncService } from "../../services/sync.service.js"

export class SyncStatusController {
  private container: HTMLElement | null = null
  private statusInterval: number | null = null

  init(selector: string): void {
    this.container = document.querySelector(selector)
    if (!this.container) return

    this.renderSyncStatus()
    this.startStatusUpdates()
  }

  private renderSyncStatus(): void {
    if (!this.container) return

    const status = syncService.getSyncStatus()
    const isOfflineMode = localStorage.getItem("offline_mode") === "true"

    let statusText = ""
    let statusClass = ""

    if (isOfflineMode) {
      statusText = "offline mode"
      statusClass = "status-offline"
    } else if (!status.isOnline) {
      statusText = "no connection"
      statusClass = "status-offline"
    } else if (!status.isAuthenticated) {
      statusText = "not synced"
      statusClass = "status-warning"
    } else if (status.pending > 0) {
      statusText = `syncing (${status.pending})`
      statusClass = "status-syncing"
    } else {
      statusText = "synced"
      statusClass = "status-online"
    }

    this.container.innerHTML = `
      <div class="sync-status ${statusClass}">
        <span class="sync-indicator">●</span>
        <span class="sync-text">${statusText}</span>
      </div>
    `
  }

  private startStatusUpdates(): void {
    this.statusInterval = window.setInterval(() => {
      this.renderSyncStatus()
    }, 5000)
  }

  destroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval)
      this.statusInterval = null
    }
  }
}

export const syncStatusController = new SyncStatusController()
