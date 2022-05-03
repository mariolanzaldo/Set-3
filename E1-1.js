class NotesAPI{
    static getAllNotes(){
        const notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]");

        return notes.sort((a, b) => {
            return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
        });
    }

    static saveNote(noteToSave){
        const notes = NotesAPI.getAllNotes();
        const existing = notes.find(note => note.id == noteToSave.id);

        if(existing){
            existing.title = noteToSave.title;
            existing.body = noteToSave.body;
            existing.updated = new Date().toISOString();
        }else{
            noteToSave.id = Math.floor(Math.random()*1000000);
            noteToSave.updated = new Date().toISOString();
            notes.push(noteToSave);
        }

        localStorage.setItem("notesapp-notes", JSON.stringify(notes));
    }

    static deleteNote(id){
        const notes = NotesAPI.getAllNotes();
        const newNotes = notes.filter(note => note.id != id);

        localStorage.setItem("notesapp-notes", JSON.stringify(newNotes));
    }
}

class NotesView {
    constructor (root, { onNoteSelect, onNoteEdit, onNoteAdd, onNoteDelete } = {}){
        this.root = root;
        this.onNoteSelect = onNoteSelect;
        this.onNoteEdit = onNoteEdit;
        this.onNoteAdd = onNoteAdd;
        this.onNoteDelete = onNoteDelete;
        this.root.innerHTML = `
        <div class="notes_sidebar">
            <button class="notes_add" type="button">Add Note</button>
            <div class="notes_list"></div>
        </div>
        <div class="notes_preview">
            <input class="notes_title" type="text" placeholder="New note...">
            <textarea class="notes_body">Introduce text...</textarea>
        </div>
        `;

        const btnAddNote = this.root.querySelector(".notes_add");
        const inpTitle = this.root.querySelector(".notes_title");
        const inpBody = this.root.querySelector(".notes_body");

        btnAddNote.addEventListener("click", () =>{
            this.onNoteAdd();
        });

        [inpTitle, inpBody].forEach(input => {
            input.addEventListener("blur", () =>{
                const updatedTitle = inpTitle.value.trim();
                const updatedBody = inpBody.value.trim();

                this.onNoteEdit(updatedTitle, updatedBody);
            });
        });

        this.updateNotePreviewVisibility(false);

    }

    createListItemHTML(id,title,body,updated){
        const MAX_BODY_LENGTH = 65;

        return `
            <div class="notes_list-item" data-note-id="${id}">
                <div class="notes_small-title"> ${title} </div>
                <div class="notes_small-body"> 
                ${body.substring(0,MAX_BODY_LENGTH)} 
                ${body.length > MAX_BODY_LENGTH ? "...":""}
                </div>
                <div class="notes_small-updated">
                ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short"})} 
                </div>
                <button class="notes_remove" type="button">Remove</button>
            </div>
        `;
    }

    updateNoteList(notes){
        const notesListContainer = this.root.querySelector(".notes_list");

        notesListContainer.innerHTML = "";

        for(const note of notes){
            const html = this.createListItemHTML(note.id, note.title, note.body, new Date(note.updated));
            notesListContainer.insertAdjacentHTML("beforeend", html);
        }

        notesListContainer.querySelectorAll(".notes_list-item").forEach(item => {
            item.addEventListener("click", () =>{
                    this.onNoteSelect(item.dataset.noteId);
            });
        });
        notesListContainer.querySelectorAll(".notes_remove").forEach(item =>{
            item.addEventListener("dblclick", () =>{
                let doDelete = confirm("Are you sure you want to delete this note?");

                if(doDelete){
                    this.onNoteDelete(item.parentElement.dataset.noteId);
                }
            });
        });
    }

    updateActiveNote(note){
        this.root.querySelector(".notes_title").value = note.title;
        this.root.querySelector(".notes_body").value = note.body;

        this.root.querySelectorAll(".notes_list-item").forEach(element =>{
            element.classList.remove("notes_list-item--selected");
        });

        this.root.querySelector(`.notes_list-item[data-note-id = "${note.id}"]`).classList.add("notes_list-item--selected");
    }

    updateNotePreviewVisibility(visible){
        this.root.querySelector(".notes_preview").style.visibility = visible ? "visible": "hidden";
    }
}

class App{
    constructor(root){
        this.notes = [];
        this.activeNote = null;
        this.view = new NotesView(root,this.handlers());

        this.refreshNotes();
    }

    refreshNotes(){
        const notes = NotesAPI.getAllNotes();

        this.setNotes(notes);
        if(notes.length > 0){
            this.setActiveNote(notes[0]);

        }
    }

    setNotes(notes){
        this.notes = notes; 
        this.view.updateNoteList(notes);
        this.view.updateNotePreviewVisibility(notes.length > 0);
    }

    setActiveNote(note){
        this.activeNote = note;
        this.view.updateActiveNote(note);
    }

    handlers () {
        return {
            onNoteSelect: noteId => {
                const selectedNote = this.notes.find(note => note.id == noteId);
                this.setActiveNote(selectedNote);
            },
            onNoteEdit: (title, body) =>{
                NotesAPI.saveNote({
                    id: this.activeNote.id,
                    title: title,
                    body: body
                });

                this.refreshNotes();
            },
            onNoteAdd: () => {
                const newNote = {
                    title: "New note",
                    body: "Take note..."
                };
                NotesAPI.saveNote(newNote);
                this.refreshNotes();
            },
            onNoteDelete: noteId =>{
                NotesAPI.deleteNote(noteId);
                this.refreshNotes();
            }
        }
    }
}

const root = document.getElementById("app");
const app = new App(root);