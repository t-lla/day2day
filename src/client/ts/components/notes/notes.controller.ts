/**
 * @packageDocumentation
 * @module NotesController
 *
 * Controller responsible for managing notes: loading, creating,
 * editing, deleting, and searching notes within the application.
 * Intermediary bewteen NotesModel for data persistance and NotesView
 * for UI rendering. 
 */
import { NotesModel } from "./notes.model.js";
import { NotesView } from "./notes.view.js";
import { Note } from "../../types.js";
import { formatDate } from "../../router.js";
import { apiService } from "../../services/api.service.js";

/**
 * Controls note-related functionality and UI updates.
 * Maintains note state and handles user events for note management.
 */
export class NotesController {
  private model: NotesModel;
  protected notes: Note[] = [];
  private currentNoteId: string | null = null;

  /** Initializes a new NotesController with its data model. */
  constructor() {
    this.model = new NotesModel();
  }

  /**
   * Loads the notes view, initializes data, and binds UI event listeners.
   *
   * @param selector - CSS selector of the container to render notes into.
   * @returns A promise that resolves when initialization is complete.
   */
  async init(selector: string): Promise<void> {
    await NotesView.render(selector);

    if (apiService.isAuthenticated()) {
      const res = await apiService.getNotes();
      if (res.data) {
        this.notes = res.data;
        this.model.saveNotes(res.data);
      } else {
        this.notes = this.model.loadNotes();
      }
    } else {
      this.notes = this.model.loadNotes();
    }

    const addNoteBtn = document.getElementById("addNoteBtn");
    const noteForm = document.getElementById("noteForm");
    const cancelNoteBtn = document.getElementById("cancelNoteBtn");
    const noteSearch = document.getElementById(
      "noteSearch"
    ) as HTMLInputElement;

    addNoteBtn?.addEventListener("click", () => {
      this.showNoteForm(null);
    });

    cancelNoteBtn?.addEventListener("click", () => {
      this.showNotesList();
    });

    noteForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveNote();
    });

    noteSearch?.addEventListener("input", () => {
      this.renderNotes(noteSearch.value);
    });

    this.renderNotes();
  }

  /**
   * @private
   * Displays the list of notes(and add button) and hides form/view containers.
   */
  private showNotesList(): void {
    NotesView.toggleVisibility("notesList", true);
    NotesView.toggleVisibility("noteFormContainer", false);
    NotesView.toggleVisibility("noteViewContainer", false);
    NotesView.toggleVisibility("addNoteBtn", true);
    this.currentNoteId = null;
  }

  /**
   * @private
   * Shows the note creation/edit form, populating fields if editing.
   * Populates the form with note data or clears it for a new note.
   *
   * @param note - The note to edit, or null to create a new one.
   * @example
   * controller.showNoteForm({ id: "1", title: "new note", ... });
   */
  private showNoteForm(note: Note | null): void {
    NotesView.toggleVisibility("notesList", false);
    NotesView.toggleVisibility("noteViewContainer", false);
    NotesView.toggleVisibility("noteFormContainer", true);
    NotesView.toggleVisibility("addNoteBtn", false);

    const title = note ? note.title : "";
    const content = note ? note.content : "";
    const tags = note ? note.tags.join(", ") : "";

    const noteFormContainer = document.getElementById("noteFormContainer");
    NotesView.renderNoteForm(note, noteFormContainer, title, content, tags);

    const noteForm = document.getElementById("noteForm") as HTMLFormElement;
    noteForm.addEventListener("submit", e => {
    e.preventDefault();
    this.saveNote();
    });

    const cancelNoteBtn = document.getElementById("cancelNoteBtn");
    cancelNoteBtn?.addEventListener("click", () => {
      this.showNotesList();
    });
  }

  /**
   * @private
   * Renders a single note for viewing.
   *
   * @param id - The identifier of the note to display.
   */
  private viewNote = (id: string): void => {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return;

    NotesView.toggleVisibility("notesList", false);
    NotesView.toggleVisibility("noteViewContainer", true);
    NotesView.toggleVisibility("noteFormContainer", false);
    NotesView.toggleVisibility("addNoteBtn", false);

    const noteViewContainer = document.getElementById("noteViewContainer");
    NotesView.renderNoteView(
      note,
      noteViewContainer,
      this.showNotesList.bind(this),
      this.editNote.bind(this),
      this.deleteNote.bind(this)
    );
  };

  /**
   * @private
   * Opens the note form populated with the existing note data for editing.
   *
   * @param id - The identifier of the note to edit.
   * @example
   * controller.editNote("1");
   */
  private editNote = (id: string): void => {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return;
    this.currentNoteId = note.id;
    this.showNoteForm(note);
  };

  /**
   * @private
   * Deletes the specified note after user confirmation.
   *
   * @param id - The identifier of the note to delete.
   * @example
   * controller.deleteNote("1");
   */
  private deleteNote = async (id: string): Promise<void> => {
    if (!confirm("¿Estás seguro/a de que quieres eliminar esta nota?")) return;

    if (apiService.isAuthenticated()) {
      const res = await apiService.deleteNote(id);
      if (!res.data) {
        console.error("Error al borrar nota en el servidor:", res.error);
        alert("No se pudo eliminar la nota en el servidor.");
        return;
      }
    }

    this.notes = this.notes.filter((n) => n.id !== id);
    this.model.saveNotes(this.notes);
    this.renderNotes();
    this.showNotesList();
  };

  /**
   * @protected //due to notes.enhanced.ts import
   * Saves a new or existing note based on the current form inputs.
   * Updates the notes array and persists changes via the model.
   */
  protected async saveNote(): Promise<void> {
    const titleInput   = document.getElementById("noteTitle")   as HTMLInputElement;
    const contentInput = document.getElementById("noteContent") as HTMLTextAreaElement;
    const tagsInput    = document.getElementById("noteTags")    as HTMLInputElement;

    const tags = tagsInput.value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title:   titleInput.value,
      content: contentInput.value,
      tags,
    };

    if (this.currentNoteId) {
      if (apiService.isAuthenticated()) {
        const res = await apiService.updateNote(this.currentNoteId, payload);
        if (res.data) {
          this.notes = this.notes.map((n) => (n.id === res.data!.id.toString() ? res.data! : n));
        } else {
          console.error("Error al actualizar nota:", res.error);
        }
      } else {
        const i = this.notes.findIndex((n) => n.id === this.currentNoteId);
        if (i !== -1) this.notes[i] = { ...this.notes[i], ...payload, updatedAt: new Date().toISOString() } as any;
      }
    } else {
      if (apiService.isAuthenticated()) {
        const res = await apiService.createNote(payload);
        if (res.data) {
          this.notes.push(res.data);
        } else {
          console.error("Error al crear nota:", res.error);
        }
      } else {
        this.notes.push({
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...payload,
        } as any);
      }
    }

    this.model.saveNotes(this.notes);
    this.renderNotes();
    this.showNotesList();
  }

  /**
   * @private
   * Renders the list of notes, optionally filtering by a search term.
   *
   * @param searchTerm - Text to filter notes by title or content (default: "").
   */
  private renderNotes(searchTerm: string = ""): void {
    const notesListElement = document.getElementById("notesList");
    NotesView.renderNotesList(
      this.notes,
      searchTerm,
      notesListElement,
      this.viewNote
    );
  }
}

/** Singleton instance of the NotesController to maintain note state. */
let notesController: NotesController | null = null;

/**
 * Initializes the NotesController(if none exists) and renders the notes into the given container.
 *
 * @returns A promise that resolves when the notes feature is initialized.
 * @example
 * await initNotes();
 */
export function initNotes(): Promise<void> {
  if (!notesController) {
    notesController = new NotesController();
  }
  return notesController.init("#content");
}
