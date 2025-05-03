/**
 * @packageDocumentation
 * @module NotesModel
 *
 * Model responsible for loading and saving notes data in localStorage.
 * Initializes default notes if none exist, used by the NotesController for data management.
 */
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
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      return JSON.parse(savedNotes) as Note[];
    } else {
      const initialNotes: Note[] = [
        {
          id: "1",
          title: "welcome note",
          content: "sigh jefe\n\nmaybe support markdown format?",
          tags: ["wip", "brrr"],
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ];
      this.saveNotes(initialNotes);
      return initialNotes;
    }
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
    localStorage.setItem("notes", JSON.stringify(notes));
  }
}
