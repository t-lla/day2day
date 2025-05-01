import { Note } from "../../types.js";
import { formatDate } from "../../router.js";
import { loadComponent } from "../loader.js";

export class NotesView {
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/notes.html");
  }

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
        const inTags = note.tags.some((tag) =>
          tag.toLowerCase().includes(term)
        );

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
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    notesListElement.innerHTML = "<h3>> your notes</h3>";

    const notesGrid = document.createElement("div");
    notesGrid.className = "notes-grid";

    sortedNotes.forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.className = "note-card";
      noteCard.setAttribute("data-id", note.id);

      const contentPreview =
        note.content.length > 100
          ? note.content.substring(0, 100) + "..."
          : note.content;

      noteCard.innerHTML = `
        <div class="note-header">
          <h4 class="note-title">${note.title}</h4>
          <span class="note-date">${formatDate(
            new Date(note.updatedAt)
          )}</span>
        </div>
        <div class="note-preview.js">${contentPreview.replace(
          /\n/g,
          "<br>"
        )}</div>
        <div class="note-tags">
          ${note.tags
            .map((tag) => `<span class="note-tag">#${tag}</span>`)
            .join(" ")}
        </div>
      `;

      noteCard.addEventListener("click", () => {
        viewNoteCallback(note.id);
      });

      notesGrid.appendChild(noteCard);
    });

    notesListElement.appendChild(notesGrid);
  }

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
            ${note.tags
              .map((tag) => `<span class="note-tag">#${tag}</span>`)
              .join(" ")}
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

    document
      .getElementById("backToNotesBtn")
      ?.addEventListener("click", backToNotesCallback);

    document
      .getElementById("editNoteBtn")
      ?.addEventListener("click", () => editNoteCallback(note.id));

    document
      .getElementById("deleteNoteBtn")
      ?.addEventListener("click", () => deleteNoteCallback(note.id));
  }

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

  static toggleVisibility(elementId: string, show: boolean): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle("hidden", !show);
    }
  }
}