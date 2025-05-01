import { NotesModel } from "./notes.model.js";
import { NotesView } from "./notes.view.js";
import { Note } from "../../types.js";
import { formatDate } from "../../router.js";

export class NotesController {
  private model: NotesModel;
  private notes: Note[] = [];
  private currentNoteId: string | null = null;

  constructor() {
    this.model = new NotesModel();
  }

  async init(selector: string): Promise<void> {
    await NotesView.render(selector);

    this.notes = this.model.loadNotes();

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

  private showNotesList(): void {
    NotesView.toggleVisibility("notesList", true);
    NotesView.toggleVisibility("noteFormContainer", false);
    NotesView.toggleVisibility("noteViewContainer", false);
    NotesView.toggleVisibility("addNoteBtn", true);
    this.currentNoteId = null;
  }

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

    const cancelNoteBtn = document.getElementById("cancelNoteBtn");
    cancelNoteBtn?.addEventListener("click", () => {
      this.showNotesList();
    });
  }

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

  private editNote = (id: string): void => {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return;
    this.currentNoteId = note.id;
    this.showNoteForm(note);
  };

  private deleteNote = (id: string): void => {
    if (confirm("sure you want to delete this?")) {
      this.notes = this.notes.filter((n) => n.id !== id);
      this.model.saveNotes(this.notes);
      this.renderNotes();
      this.showNotesList();
    }
  };

  private saveNote(): void {
    const titleInput = document.getElementById("noteTitle") as HTMLInputElement;
    const contentInput = document.getElementById(
      "noteContent"
    ) as HTMLTextAreaElement;
    const tagsInput = document.getElementById("noteTags") as HTMLInputElement;

    const tags = tagsInput.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (this.currentNoteId) {
      const noteIndex = this.notes.findIndex((n) => n.id === this.currentNoteId);
      if (noteIndex !== -1) {
        this.notes[noteIndex] = {
          ...this.notes[noteIndex],
          title: titleInput.value,
          content: contentInput.value,
          tags: tags,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: titleInput.value,
        content: contentInput.value,
        tags: tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.notes.push(newNote);
    }

    this.model.saveNotes(this.notes);
    this.renderNotes();
    this.showNotesList();
  }

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

let notesController: NotesController | null = null;

export function initNotes(): Promise<void> {
  if (!notesController) {
    notesController = new NotesController();
  }
  return notesController.init("#content");
}