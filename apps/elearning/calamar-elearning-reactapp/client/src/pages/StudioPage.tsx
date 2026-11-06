import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { api, type Category, type CourseSummary } from '../api';
import { categoryOptions, ErrorBox, Modal, useLoad } from '../components/ui';

export default function StudioPage() {
  const [courses, error] = useLoad(() => api.get<CourseSummary[]>('/studio/courses'), []);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="page-head">
        <h1>My studio</h1>
        <button className="btn primary" onClick={() => setCreating(true)}>＋ New course</button>
      </div>
      <ErrorBox error={error} />
      {courses && courses.length === 0 && <div className="empty">You haven't created any course yet.</div>}
      {courses && courses.length > 0 && (
        <table className="table">
          <thead><tr><th>Course</th><th>Category</th><th>Status</th><th>Learners</th><th>Updated</th><th /></tr></thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/studio/${c.id}`}><b>{c.title}</b></Link><div className="tags">{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div></td>
                <td className="muted">{c.categoryPath.join(' › ') || '—'}</td>
                <td>{c.published ? <span className="pill ok">Published</span> : <span className="pill warn">Draft</span>}</td>
                <td>{c.subscriberCount}</td>
                <td className="muted small">{new Date(c.updatedAt).toLocaleString()}</td>
                <td className="right">
                  <Link className="btn small" to={`/studio/${c.id}`}>Edit</Link>{' '}
                  <Link className="btn ghost small" to={`/courses/${c.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {creating && <NewCourseModal onClose={() => setCreating(false)} />}
    </div>
  );
}

function NewCourseModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [categories] = useLoad(() => api.get<Category[]>('/catalog/categories'), []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api.post<{ id: number }>('/studio/courses', {
        title, description, categoryId: categoryId ? Number(categoryId) : null, tags: [], published: false,
      });
      navigate(`/studio/${r.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title="New course" onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label>Title<input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} /></label>
        <label>Short description<textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— none —</option>
            {categoryOptions(categories ?? []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <p className="muted small">The course starts as a draft. Add chapters and pages, then publish it.</p>
        <ErrorBox error={error} />
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>Create</button>
        </div>
      </form>
    </Modal>
  );
}
