/**
 * @packageDocumentation
 * @module NotesEnhanced
 *
 * Enhanced notes controller with API synchronization capabilities.
 */

import { NotesController } from "../components/notes/notes.controller.js"
import { syncService } from "../services/sync.service.js"

export class NotesEnhanced extends NotesController {
  async init(selector: string): Promise<void> {
    await super.init(selector)
    this.setupSyncHooks()
  }

  private setupSyncHooks(): void {
    const originalSaveNote = this.saveNote as () => Promise<void> | void;

    this.saveNote = async () => {

        await Promise.resolve(originalSaveNote.call(this));

        syncService.queueOperation({
            type: "update",
            entity: "note",
            data: this.notes,
        });
    }
  }
}

