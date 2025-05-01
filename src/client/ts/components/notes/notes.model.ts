import { Note } from "../../types.js";

export class NotesModel {
  loadNotes(): Note[] {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      return JSON.parse(savedNotes);
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

  saveNotes(notes: Note[]): void {
    localStorage.setItem("notes", JSON.stringify(notes));
  }
}