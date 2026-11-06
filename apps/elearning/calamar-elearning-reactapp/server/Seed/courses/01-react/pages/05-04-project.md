Time to put it all together. You will build a small **notes app** that uses nearly everything from this course.

## Features

- Create, edit and delete notes, each with a title and a body.
- Search notes by text.
- Notes survive page reloads (stored in `localStorage`).
- A list on the left and an editor on the right.

## Concepts used

| Feature | React concept |
|---|---|
| The list of notes | `useReducer` with actions `added`, `updated`, `deleted` |
| Persistence | the `useLocalStorage` idea, inside an effect |
| Search | a controlled input and *derived* filtered list |
| Selected note | `useState` lifted up into `NotesApp` |
| Editor | controlled inputs dispatching `updated` |
| Note rows | list rendering with stable keys |

## Steps

1. Create a fresh Vite project and copy the attached `NotesApp.jsx` and `notes.css` into `src/`.
2. Render `<NotesApp />` from `App.jsx` and run `npm run dev`.
3. Read the code top to bottom; every part maps to a lesson of this course.

## Extend it

Try these on your own:

1. **Sort** notes by last update, newest first.
2. Add **tags** to notes and a tag filter.
3. Render the body as **Markdown** (look at the `react-markdown` package).
4. Add a **confirmation** before deleting.
5. Move the notes into a **context** and add a second page using React Router showing statistics.

Congratulations on finishing the course! 🎉
