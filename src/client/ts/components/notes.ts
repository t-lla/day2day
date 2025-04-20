import { formatDate } from "../router.js";
import { loadComponent } from "./loader.js";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

let notes: Note[] = [];
let currentNoteId: string | null = null;

export async function initNotes(): Promise<void> {
  await loadComponent("#content", "../../components/notes.html");

  loadNotes();

  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteForm = document.getElementById("noteForm");
  const cancelNoteBtn = document.getElementById("cancelNoteBtn");
  const noteSearch = document.getElementById("noteSearch") as HTMLInputElement;

  addNoteBtn?.addEventListener("click", () => {
    document.getElementById("notesList")?.classList.add("hidden");
    document.getElementById("noteFormContainer")?.classList.remove("hidden");
    document.getElementById("noteViewContainer")?.classList.add("hidden");
    addNoteBtn.classList.add("hidden");
    currentNoteId = null;
  });

  cancelNoteBtn?.addEventListener("click", () => {
    document.getElementById("notesList")?.classList.remove("hidden");
    document.getElementById("noteFormContainer")?.classList.add("hidden");
    addNoteBtn?.classList.remove("hidden");
    (noteForm as HTMLFormElement)?.reset();
  });

  noteForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleInput = document.getElementById("noteTitle") as HTMLInputElement;
    const contentInput = document.getElementById(
      "noteContent"
    ) as HTMLTextAreaElement;
    const tagsInput = document.getElementById("noteTags") as HTMLInputElement;

    const tags = tagsInput.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (currentNoteId) {
      const noteIndex = notes.findIndex((n) => n.id === currentNoteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
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

      notes.push(newNote);
    }

    saveNotes();
    renderNotes();
    (noteForm as HTMLFormElement).reset();
    document.getElementById("notesList")?.classList.remove("hidden");
    document.getElementById("noteFormContainer")?.classList.add("hidden");
    addNoteBtn?.classList.remove("hidden");
    currentNoteId = null;
  });

  noteSearch?.addEventListener("input", () => {
    renderNotes(noteSearch.value);
  });

  renderNotes();
}

function loadNotes(): void {
  const savedNotes = localStorage.getItem("notes");
  if (savedNotes) {
    notes = JSON.parse(savedNotes);
  } else {
    notes = [
      //example note
      {
        id: "1",
        title: "welcome note",
        content: "fuck around n find out\n\nmaybe support markdown format?",
        tags: ["wip", "bruh"],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];
    saveNotes();
  }
}

function saveNotes(): void {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNotes(searchTerm = ""): void {
  const notesList = document.getElementById("notesList");
  if (!notesList) return;

  let filteredNotes = notes;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();

    filteredNotes = notes.filter((note) => {
      //looking for the search term
      const inTitle = note.title.toLowerCase().includes(term);
      const inContent = note.content.toLowerCase().includes(term);
      const inTags = note.tags.some((tag) => tag.toLowerCase().includes(term));

      const createdStr = formatDate(new Date(note.createdAt)).toLowerCase();
      const updatedStr = formatDate(new Date(note.updatedAt)).toLowerCase();
      const inDates = createdStr.includes(term) || updatedStr.includes(term); //in dates too

      return inTitle || inContent || inTags || inDates;
    });
  }

  if (filteredNotes.length === 0) {
    notesList.innerHTML = searchTerm
      ? "<p>> no notes found matching your search.</p>"
      : "<p>> no notes found. create something.</p>";
    return;
  }

  const sortedNotes = [...filteredNotes].sort(
    //orden por más reciente
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  notesList.innerHTML = "<h3>> your notes</h3>";

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
        <span class="note-date">${formatDate(new Date(note.updatedAt))}</span>
      </div>
      <div class="note-preview">${contentPreview.replace(/\n/g, "<br>")}</div>
      <div class="note-tags">
        ${note.tags.map((tag) => `<span class="note-tag">#${tag}</span>`).join(" ")}
      </div>
    `;

    noteCard.addEventListener("click", () => {
      viewNote(note.id);
    });

    notesGrid.appendChild(noteCard);
  });

  notesList.appendChild(notesGrid);
}

function viewNote(id: string): void {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  const notesList = document.getElementById("notesList");
  const noteViewContainer = document.getElementById("noteViewContainer");
  const addNoteBtn = document.getElementById("addNoteBtn");

  if (notesList && noteViewContainer && addNoteBtn) {
    notesList.classList.add("hidden");
    noteViewContainer.classList.remove("hidden");
    addNoteBtn.classList.add("hidden");

    noteViewContainer.innerHTML = `
      <div class="note-view">
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

    document.getElementById("backToNotesBtn")?.addEventListener("click", () => {
      noteViewContainer.classList.add("hidden");
      notesList.classList.remove("hidden");
      addNoteBtn.classList.remove("hidden");
    });

    document.getElementById("editNoteBtn")?.addEventListener("click", () => {
      editNote(note.id);
    });

    document.getElementById("deleteNoteBtn")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this note?")) {
        deleteNote(note.id);
        noteViewContainer.classList.add("hidden");
        notesList.classList.remove("hidden");
        addNoteBtn.classList.remove("hidden");
      }
    });
  }
}

function editNote(id: string): void {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  const noteForm = document.getElementById("noteForm") as HTMLFormElement;
  const titleInput = document.getElementById("noteTitle") as HTMLInputElement;
  const contentInput = document.getElementById(
    "noteContent"
  ) as HTMLTextAreaElement;
  const tagsInput = document.getElementById("noteTags") as HTMLInputElement;

  titleInput.value = note.title;
  contentInput.value = note.content;
  tagsInput.value = note.tags.join(", ");

  currentNoteId = note.id;

  document.getElementById("notesList")?.classList.add("hidden");
  document.getElementById("noteViewContainer")?.classList.add("hidden");
  document.getElementById("noteFormContainer")?.classList.remove("hidden");
  document.getElementById("addNoteBtn")?.classList.add("hidden");
}

function deleteNote(id: string): void {
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  renderNotes();
}
