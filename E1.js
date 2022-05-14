const notesAPI = {
    getAllNotes: function () {
        const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
        return notes.sort((a, b) => {
            return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
        });
    },
    saveNote: function (noteToSave) {
        const notes = this.getAllNotes();
        const existing = notes.find(note => note.id == noteToSave.id);

        if (existing) {
            if (existing.content !== noteToSave.content) {
                existing.content = noteToSave.content;
                existing.updated = new Date().toISOString();
            }
        } else {
            noteToSave.id = Date.now();
            noteToSave.updated = new Date().toISOString();
            notes.push(noteToSave);
        }

        localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
    },
    deleteNote: function (id) {
        const notes = this.getAllNotes();
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

        const template1 = document.querySelector(".template1").content;
        const fragment = document.createDocumentFragment();

        const clone = template1.cloneNode(true);
        fragment.appendChild(clone);
        this.root.appendChild(fragment);
        const btnAddNote = this.root.querySelector(".add-note");

        btnAddNote.addEventListener("click", () => {
            this.onNoteAdd(this.root);
        });

        const allNotes = document.querySelector(".note-list");
        allNotes.addEventListener("dblclick", item => {
            if (item.target.className === 'note-remove') {
                let doDelete = confirm("Are you sure you want to delete this note?");
                if (doDelete) {
                    this.onNoteDelete(item.target.parentElement.dataset.noteId);
                }
            }
        });
    }

    createListItemHTML(id, content, created, updated) {
        const template2 = document.querySelector(".template2").content;
        const fragment = document.createDocumentFragment();

        const cont = template2.querySelector(".container");
        const note = template2.querySelector(".note");
        const noteCreate = template2.querySelector(".note-creation");
        const noteUpdate = template2.querySelector(".note-update");

        cont.setAttribute("data-note-id", id);
        cont.setAttribute("id", id);
        note.setAttribute("id", id);
        note.innerHTML = content;
        noteCreate.innerHTML = `Created: ${created}`;
        noteUpdate.setAttribute("id", id);
        noteUpdate.innerHTML = `Updated: ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`;

        const clone = template2.cloneNode(true);
        fragment.appendChild(clone);
        return fragment;
    }

    updateNoteList(notes) {
        const notesListContainer = this.root.querySelector(".note-list");
        notesListContainer.innerHTML = "";

        for (const note of notes) {
            const html = this.createListItemHTML(note.id, note.content, note.create, new Date(note.updated));
            notesListContainer.appendChild(html);
        }

        const allNotes = document.querySelector(".note-list");

        allNotes.addEventListener('keydown', function (e) {
            if (e.key == 'Tab' && e.target.className === "note") {
                e.preventDefault();
                let start = e.target.selectionStart;
                let end = e.target.selectionEnd;

                e.target.value = e.target.value.substring(0, start) + "\t" + e.target.value.substring(end);
                e.target.selectionEnd = start + 1;
            }
        });

        allNotes.addEventListener("click", item => {
            if (item.target.className === 'note-save') {
                const updatedBody = item.target.previousElementSibling.value.trim();
                this.onNoteEdit(updatedBody, item.target.parentElement.dataset.noteId);
            }
        });

    }

}

class App {
    constructor(root, notesAPI) {
        this.notes = [];
        this.notesAPI = notesAPI;
        this.activeNote = null;
        this.view = new NotesView(root, this.handlers());

        this.refreshNotes();

    }

    refreshNotes() {
        const notes = this.notesAPI.getAllNotes();
        this.setNotes(notes);
    }

    setNotes(notes) {
        this.notes = notes;
        this.view.updateNoteList(notes);
    }

    handlers() {
        return {
            onNoteEdit: (content, id) => {

                this.notesAPI.saveNote({
                    id: id,
                    content: content,
                });

                this.refreshNotes();
            },
            onNoteAdd: () => {
                const notes = this.notesAPI.getAllNotes();

                const noteObject = {
                    id: Date.now(),
                    content: "",
                    create: `${new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`
                }
                notes.push(noteObject);
                this.notesAPI.saveNote(noteObject);
                this.refreshNotes();
            },
            onNoteDelete: noteId => {
                this.notesAPI.deleteNote(noteId);
                this.refreshNotes();
            }
        };
    }
}

const root = document.getElementById("app");
const app = new App(root, notesAPI);
