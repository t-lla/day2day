/**
 * @packageDocumentation
 * @module NotesModel
 *
 * Model responsible for loading and saving notes data in localStorage.
 * Initializes default notes if none exist, used by the NotesController for data management.
 */
import { storageService } from "../../services/storage.service.js";
import { Note } from "../../types.js";

/**
 * NotesModel provides methods to retrieve and persist notes
 * stored in the browser's localStorage.
 */
export class NotesModel {
  /**
   * Loads notes from localStorage. If no notes are stored,
   * initializes with a default welcome note and saves it.
   *
   * @returns An array of Note objects.
   * @example
   * const model = new NotesModel();
   * const notes = model.loadNotes();
   */
  loadNotes(): Note[] {
    const notes = storageService.get<Note[]>("notes", null);
    if (notes) return notes;
    
    const initialNotes: Note[] = [
      {
        id: "1",
        title: "Welcome note!",
        content: "This is a placeholder note.\n\nWrite whatever you want!",
        tags: ["wip", "test"],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];
    this.saveNotes(initialNotes);
  return initialNotes;
}

  /**
   * Saves the provided array of notes to localStorage under the key 'notes'.
   * Serializes the notes as JSON for storage.
   *
   * @param notes - The array of Note objects to store.
   * @example
   * const model = new NotesModel();
   * model.saveNotes([{ id: "1", title: "new note", ... }]);
   */
  saveNotes(notes: Note[]): void {
    storageService.set("notes", notes);
  }
}
