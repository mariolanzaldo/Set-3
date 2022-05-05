function getNotes() {
    return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
}

function saveNotes(notes) {
    localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

function addNote() {
    const notes = getNotes();

    const noteObject = {
        id: Math.floor(Math.random() * 100000),
        content: "",
        updated: `${new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`,
        create: `${new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`
    };

    notes.push(noteObject);
    saveNotes(notes);

    const noteElement = createNoteElement(noteObject.id, noteObject.content, noteObject.create, noteObject.updated);
    notesContainer.insertBefore(noteElement, addNoteButton);

}

function createNoteElement(id, content, create, updated) {
    const element = document.createElement("textarea");
    const textCont = document.createElement("div");
    const createDate = document.createElement("div");
    const updateDate = document.createElement("div");

    updateDate.classList.add("note-update");
    updateDate.id = `${id}`;
    updateDate.innerHTML = `Updated: ${updated}`

    textCont.classList.add("container");
    textCont.appendChild(element);
    textCont.appendChild(createDate);
    textCont.appendChild(updateDate);

    createDate.classList.add("note-creation");
    createDate.innerHTML = `Created: ${create}`;

    element.classList.add("note");
    element.value = content;
    element.placeholder = "Empty Sticky Note";

    element.addEventListener("change", () => {
        updateNote(id, element.value);
    });

    element.addEventListener("dblclick", () => {
        const doDelete = confirm(
            "Are you sure you wish to delete this sticky note?"
        );

        if (doDelete) {
            deleteNote(id, textCont);
        }
    });

    return textCont;

}

function updateNote(id, newContent) {
    let notes = getNotes();
    const date = new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
    const existing = notes.find(note => note.id == id);

    if (existing) {
        existing.updated = `${date}`;
        existing.content = newContent;
        document.getElementById(`${id}`).innerHTML = `Updated: ${date}`;
        saveNotes(notes);
    } else {
        saveNotes(notes);
    }
}

function deleteNote(id, element) {
    const notes = getNotes().filter((note) => note.id != id);

    saveNotes(notes);
    notesContainer.removeChild(element);
}

const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");

getNotes().forEach((note) => {
    const noteElement = createNoteElement(note.id, note.content, note.create, note.updated);
    notesContainer.insertBefore(noteElement, addNoteButton);
});

addNoteButton.addEventListener("click", () => addNote());
