class NotesAPI {
    static getAllNotes() {
        const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
        return notes.sort((a, b) => {
            return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
        });
    }

    static saveNote(noteToSave) {
        const notes = NotesAPI.getAllNotes();
        const existing = notes.find(note => note.id == noteToSave.id);

        if (existing) {
            if (existing.content !== noteToSave.content) {
                existing.content = noteToSave.content;
                existing.updated = new Date().toISOString();
            }
        } else {
            noteToSave.id = Math.floor(Math.random() * 1000000);
            noteToSave.updated = new Date().toISOString();
            notes.push(noteToSave);
        }

        localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
    }

    static deleteNote(id) {
        const notes = NotesAPI.getAllNotes();
        const newNotes = notes.filter(note => note.id != id);
        localStorage.setItem("stickynotes-notes", JSON.stringify(newNotes));
    }
}

class NotesView {
    constructor(root, { onNoteAdd, onNoteEdit, onNoteDelete } = {}) {
        this.root = root;
        this.onNoteAdd = onNoteAdd;
        this.onNoteEdit = onNoteEdit;
        this.onNoteDelete = onNoteDelete;
        this.root.innerHTML = `
        <button class="add-note" type="button">+</button>
        <div class="note-list"></div>
        `;

        const btnAddNote = this.root.querySelector(".add-note");

        btnAddNote.addEventListener("click", () => {
            this.onNoteAdd(this.root);
        });
    }

    createListItemHTML(id, content, created, updated) {
        return ` <div class="container" data-note-id="${id}" id="${id}">
        <textarea class="note" class="${id}" placeholder="Empty Note">${content}</textarea>
        <div class="note-creation">Created: ${created}</div>
        <div class="note-update" id="${id}">Updated: ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</div>
    </div>`;
    }

    updateNoteList(notes) {
        const notesListContainer = this.root.querySelector(".note-list");
        notesListContainer.innerHTML = "";

        for (const note of notes) {
            const html = this.createListItemHTML(note.id, note.content, note.create, new Date(note.updated));
            notesListContainer.insertAdjacentHTML("beforeend", html);
        }

        document.querySelectorAll(".note").forEach(item => {
            item.addEventListener("change", () => {
                const updatedBody = item.value.trim();
                this.onNoteEdit(updatedBody, item.parentElement.dataset.noteId);
            });

            item.addEventListener("dblclick", () => {
                let doDelete = confirm("Are you sure you want to delete this note?");

                if (doDelete) {
                    this.onNoteDelete(item.parentElement.dataset.noteId);
                }
            });
        });
    }
}

class App {
    constructor(root) {
        this.notes = [];
        this.activeNote = null;
        this.view = new NotesView(root, this.handlers());

        this.refreshNotes();

    }

    refreshNotes() {
        const notes = NotesAPI.getAllNotes();
        this.setNotes(notes);
    }

    setNotes(notes) {
        this.notes = notes;
        this.view.updateNoteList(notes);
    }

    handlers() {
        return {
            onNoteEdit: (content, id) => {

                NotesAPI.saveNote({
                    id: id,
                    content: content,
                });

                this.refreshNotes();
            },
            onNoteAdd: () => {
                const notes = NotesAPI.getAllNotes();

                const noteObject = {
                    id: Math.floor(Math.random() * 100000),
                    content: "",
                    create: `${new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`
                }
                notes.push(noteObject);
                NotesAPI.saveNote(noteObject);
                this.refreshNotes();
            },
            onNoteDelete: noteId => {
                NotesAPI.deleteNote(noteId);
                this.refreshNotes();
            }
        };
    }
}

const root = document.getElementById("app");
const app = new App(root);
