/**
 * @packageDocumentation
 * @module NotesView
 *
 * Provides methods for rendering the notes UI, including lists,
 * detailed views, and forms within the application.
 */
import { Note } from "../../types.js";
import { formatDate } from "../../router.js";
import { loadComponent } from "../loader.js";

/**
 * NotesView offers static functions to load the notes template
 * and manipulate the DOM for listing, viewing, creating,
 * and editing notes.
 */
export class NotesView {
  /**
   * Renders the main notes component into the specified DOM container.
   * Loads the notes HTML template using the loadComponent utility.
   *
   * @param selector - CSS selector of the element where the notes view will be injected.
   * @returns A promise that resolves when the component is loaded.
   * @example
   * await NotesView.render('#content');
   */
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/notes.html");
  }

  /**
   * Displays a list of notes, optionally filtered by a search term.
   * Creates a grid of note cards sorted by last update date.
   *
   * @param notes - Array of Note objects to render.
   * @param searchTerm - Text to filter notes by title, content, tags, or dates.
   * @param notesListElement - The DOM element where the list should be rendered.
   * @param viewNoteCallback - Callback invoked with note ID when a note card is clicked.
   * @example
   * const notes = [{ id: "1", title: "new note", content: "note content", ... }];
   * const notesList = document.getElementById('notesList');
   * NotesView.renderNotesList(notes, "test", notesList, (id) => console.log('View note ${id}'));
   */
  static renderNotesList(
    notes: Note[],
    searchTerm: string,
    notesListElement: HTMLElement | null,
    viewNoteCallback: (id: string) => void
  ): void {
    if (!notesListElement) return;

    let filteredNotes = notes;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredNotes = notes.filter((note) => {
        const inTitle = note.title.toLowerCase().includes(term);
        const inContent = note.content.toLowerCase().includes(term);
        const inTags = note.tags.some((tag) => tag.toLowerCase().includes(term));

        const createdStr = formatDate(new Date(note.createdAt)).toLowerCase();
        const updatedStr = formatDate(new Date(note.updatedAt)).toLowerCase();
        const inDates = createdStr.includes(term) || updatedStr.includes(term);

        return inTitle || inContent || inTags || inDates;
      });
    }

    if (filteredNotes.length === 0) {
      notesListElement.innerHTML = searchTerm
        ? "<p>> no notes found matching your search.</p>"
        : "<p>> no notes found. create something.</p>";
      return;
    }

    const sortedNotes = [...filteredNotes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    notesListElement.innerHTML = "<h3>> your notes</h3>";
    const notesGrid = document.createElement("div");
    notesGrid.className = "notes-grid";

    sortedNotes.forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.className = "note-card";
      noteCard.setAttribute("data-id", note.id);

      const contentPreview =
        note.content.length > 100 ? note.content.substring(0, 100) + "..." : note.content;

      noteCard.innerHTML = `
        <div class="note-header">
          <h4 class="note-title">${note.title}</h4>
          <span class="note-date">${formatDate(new Date(note.updatedAt))}</span>
        </div>
        <div class="note-preview.js">${contentPreview.replace(/\n/g, "<br>")}</div>
        <div class="note-tags">
          ${note.tags.map((tag) => `<span class="note-tag">#${tag}</span>`).join(" ")}
        </div>
      `;

      noteCard.addEventListener("click", () => viewNoteCallback(note.id));
      notesGrid.appendChild(noteCard);
    });
    notesListElement.appendChild(notesGrid);
  }

  /**
   * Renders a detailed view of a single note, including metadata
   * and action buttons for editing or deleting.
   * Binds event listeners for edit, delete, and back actions.
   *
   * @param note - The Note object to display.
   * @param noteViewContainer - The DOM element where the note view will be injected.
   * @param backToNotesCallback - Callback for returning to the notes list.
   * @param editNoteCallback - Callback invoked with note id to edit.
   * @param deleteNoteCallback - Callback invoked with note id to delete.
   * @example
   * const note = { id: "1", title: "new note", content: "note content", ... };
   * const container = document.getElementById('noteViewContainer');
   * NotesView.renderNoteView(note, container, () => console.log('Back'), 
   *  (id) => console.log('Edit ${id}'), (id) => console.log('Delete ${id}'));
   */
  static renderNoteView(
    note: Note,
    noteViewContainer: HTMLElement | null,
    backToNotesCallback: () => void,
    editNoteCallback: (id: string) => void,
    deleteNoteCallback: (id: string) => void
  ): void {
    if (!noteViewContainer) return;

    noteViewContainer.innerHTML = `
      <div class="note-view.js">
        <div class="note-view-header">
          <h3>${note.title}</h3>
          <div class="note-view-meta">
            <span>Created: ${formatDate(new Date(note.createdAt))}</span>
            <span>Updated: ${formatDate(new Date(note.updatedAt))}</span>
          </div>
          <div class="note-view-tags">
            ${note.tags.map((tag) => `<span class="note-tag">#${tag}</span>`).join(" ")}
          </div>
        </div>

        <div class="note-view-content">
          ${note.content.replace(/\n/g, "<br>")}
        </div>

        <div class="note-view-actions">
          <button id="editNoteBtn" class="action-btn">edit</button>
          <button id="deleteNoteBtn" class="action-btn">delete</button>
          <button id="backToNotesBtn" class="action-btn">back</button>
        </div>
      </div>
    `;

    document.getElementById("backToNotesBtn")?.addEventListener("click", backToNotesCallback);
    document.getElementById("editNoteBtn")?.addEventListener("click", () => editNoteCallback(note.id));
    document.getElementById("deleteNoteBtn")?.addEventListener("click", () => deleteNoteCallback(note.id));
  }

  /**
   * Renders the note creation/edit form with provided default values.
   * Injects a form with title, content, and tags inputs into the specified container.
   *
   * @param note - The Note object to edit, or null to create a new note.
   * @param noteFormContainer - The DOM element for the form.
   * @param title - Default title text for the form input.
   * @param content - Default content text for the textarea.
   * @param tags - Default comma-separated tags string.
   * @example
   * const container = document.getElementById('noteFormContainer');
   * NotesView.renderNoteForm(null, container, '', '', '');
   */
  static renderNoteForm(
    note: Note | null,
    noteFormContainer: HTMLElement | null,
    title: string,
    content: string,
    tags: string
  ): void {
    if (!noteFormContainer) return;

    noteFormContainer.innerHTML = `
      <h3>> ${note ? "edit note" : "add note"}</h3>
      <form id="noteForm" class="data-form">
        <div class="form-group">
          <label for="noteTitle">title</label>
          <input type="text" id="noteTitle" value="${title}" required>
        </div>

        <div class="form-group">
          <label for="noteContent">content</label>
          <textarea id="noteContent" rows="10">${content}</textarea>
        </div>

        <div class="form-group">
          <label for="noteTags">tags</label>
          <input type="text" id="noteTags" placeholder="(comma separated)" value="${tags}">
        </div>

        <div class="form-actions">
          <button type="submit" class="action-btn">save</button>
          <button type="button" id="cancelNoteBtn" class="action-btn">cancel</button>
        </div>
      </form>
    `;
  }

  /**
   * Toggles visibility of an element by adding or removing the "hidden" class.
   *
   * @param elementId - The id of the element to show or hide.
   * @param show - True to show the element; false to hide.
   * @example
   * NotesView.toggleVisibility('notesList', true);
   */
  static toggleVisibility(elementId: string, show: boolean): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle("hidden", !show);
    }
  }
}
