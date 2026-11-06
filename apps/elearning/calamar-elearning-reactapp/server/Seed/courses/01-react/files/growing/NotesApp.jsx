import { useEffect, useReducer, useState } from 'react';
import './notes.css';

const STORAGE_KEY = 'notes-app';

function notesReducer(notes, action) {
  switch (action.type) {
    case 'added':
      return [{ id: crypto.randomUUID(), title: 'Untitled', body: '', updatedAt: Date.now() }, ...notes];
    case 'updated':
      return notes.map((n) => (n.id === action.id ? { ...n, ...action.changes, updatedAt: Date.now() } : n));
    case 'deleted':
      return notes.filter((n) => n.id !== action.id);
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function NoteList({ notes, selectedId, onSelect }) {
  if (notes.length === 0) return <p className="empty">No notes.</p>;
  return (
    <ul className="note-list">
      {notes.map((n) => (
        <li key={n.id} className={n.id === selectedId ? 'selected' : ''} onClick={() => onSelect(n.id)}>
          <strong>{n.title || 'Untitled'}</strong>
          <span>{n.body.slice(0, 40) || 'Empty note'}</span>
        </li>
      ))}
    </ul>
  );
}

function Editor({ note, dispatch }) {
  if (!note) return <div className="editor empty">Select or create a note.</div>;
  const update = (changes) => dispatch({ type: 'updated', id: note.id, changes });
  return (
    <div className="editor">
      <input value={note.title} onChange={(e) => update({ title: e.target.value })} placeholder="Title" />
      <textarea value={note.body} onChange={(e) => update({ body: e.target.value })} placeholder="Write something…" />
      <footer>
        <small>Updated {new Date(note.updatedAt).toLocaleString()}</small>
        <button onClick={() => dispatch({ type: 'deleted', id: note.id })}>Delete</button>
      </footer>
    </div>
  );
}

export default function NotesApp() {
  const [notes, dispatch] = useReducer(notesReducer, undefined, loadNotes);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Derived data: no extra state.
  const q = query.toLowerCase();
  const visible = notes.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
  const selected = notes.find((n) => n.id === selectedId);

  function addNote() {
    dispatch({ type: 'added' });
    setQuery('');
  }

  // Select a freshly added note (it is always first).
  useEffect(() => {
    if (notes.length > 0 && !notes.some((n) => n.id === selectedId)) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  return (
    <div className="notes-app">
      <aside>
        <div className="toolbar">
          <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button onClick={addNote}>＋</button>
        </div>
        <NoteList notes={visible} selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <Editor note={selected} dispatch={dispatch} />
    </div>
  );
}
