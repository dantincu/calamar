import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api, enc, fileUrl, type Category, type CourseSummary, type OutlineNode, type PageView, type Tag } from '../api';
import { FileList, Markdown } from '../components/content';
import { categoryOptions, ErrorBox, Modal, useLoad } from '../components/ui';

interface StudioCourse { course: CourseSummary; outline: OutlineNode[] }

export default function StudioCoursePage() {
  const { id, '*': selected = '' } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();
  const [data, error, reload] = useLoad(() => api.get<StudioCourse>(`/studio/courses/${courseId}`), [courseId]);
  const [adding, setAdding] = useState<{ parent: string; kind: 'page' | 'chapter' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const dirty = useRef(false);

  const select = (path: string) => {
    if (dirty.current && !confirm('You have unsaved changes. Leave them?')) return;
    dirty.current = false;
    navigate(`/studio/${courseId}/${enc(path)}`);
  };

  async function act(f: () => Promise<void>) {
    setActionError(null);
    try { await f(); } catch (e) { setActionError((e as Error).message); }
  }

  const move = (n: OutlineNode, direction: number) => act(async () => {
    const r = await api.post<{ path: string }>(`/studio/courses/${courseId}/move`, { path: n.path, direction });
    reload();
    if (selected === n.path && r.path !== n.path) navigate(`/studio/${courseId}/${enc(r.path)}`, { replace: true });
  });

  const remove = (n: OutlineNode) => act(async () => {
    const what = n.kind === 'chapter' ? `the chapter "${n.title}" with everything in it` : `the page "${n.title}"`;
    if (!confirm(`Delete ${what}? This can't be undone.`)) return;
    await api.del(`/studio/courses/${courseId}/nodes/${enc(n.path)}`);
    reload();
    if (selected === n.path || selected.startsWith(n.path + '/')) navigate(`/studio/${courseId}`, { replace: true });
  });

  if (error) return <ErrorBox error={error} />;
  if (!data) return <p className="muted">Loading…</p>;

  return (
    <div className="studio">
      <aside className="studio-tree">
        <div className="crumbs"><Link to="/studio">Studio</Link> ›</div>
        <button className={selected === '' ? 'tree-root active' : 'tree-root'} onClick={() => select('')}>
          <b>{data.course.title}</b>
          <small>{data.course.published ? 'Published' : 'Draft'} · course settings</small>
        </button>
        <OutlineEditor nodes={data.outline} selected={selected} onSelect={(n) => select(n.path)} onMove={move} onDelete={remove}
          onAdd={(parent, kind) => setAdding({ parent, kind })} />
        <div className="tree-add">
          <button className="btn small" onClick={() => setAdding({ parent: '', kind: 'page' })}>＋ Page</button>
          <button className="btn small" onClick={() => setAdding({ parent: '', kind: 'chapter' })}>＋ Chapter</button>
        </div>
        <p className="muted small hint">Within a chapter, pages come first, then sub-chapters. Use ↑ ↓ to reorder.</p>
        <ErrorBox error={actionError} />
      </aside>
      <section className="studio-main">
        {selected === ''
          ? <CourseSettings course={data.course} onSaved={reload} />
          : <NodeEditor key={selected} courseId={courseId} path={selected} dirty={dirty} onSaved={reload} />}
      </section>
      {adding && (
        <AddNodeModal courseId={courseId} {...adding} onClose={() => setAdding(null)}
          onAdded={(path) => { setAdding(null); reload(); dirty.current = false; navigate(`/studio/${courseId}/${enc(path)}`); }} />
      )}
    </div>
  );
}

function OutlineEditor({ nodes, selected, onSelect, onMove, onDelete, onAdd }: {
  nodes: OutlineNode[];
  selected: string;
  onSelect: (n: OutlineNode) => void;
  onMove: (n: OutlineNode, direction: number) => void;
  onDelete: (n: OutlineNode) => void;
  onAdd: (parent: string, kind: 'page' | 'chapter') => void;
}) {
  if (nodes.length === 0) return null;
  return (
    <ul className="tree">
      {nodes.map((n) => {
        const same = nodes.filter((s) => s.kind === n.kind);
        const pos = same.indexOf(n);
        return (
          <li key={n.path}>
            <div className={`tree-row ${n.kind}${selected === n.path ? ' active' : ''}`}>
              <button className="tree-title" onClick={() => onSelect(n)} title={n.title}>
                <span aria-hidden>{n.kind === 'chapter' ? '📁' : '📄'}</span> {n.title}
              </button>
              <span className="tree-actions">
                <button title="Move up" disabled={pos === 0} onClick={() => onMove(n, -1)}>↑</button>
                <button title="Move down" disabled={pos === same.length - 1} onClick={() => onMove(n, 1)}>↓</button>
                {n.kind === 'chapter' && <button title="Add a page to this chapter" onClick={() => onAdd(n.path, 'page')}>＋📄</button>}
                {n.kind === 'chapter' && <button title="Add a sub-chapter" onClick={() => onAdd(n.path, 'chapter')}>＋📁</button>}
                <button title="Delete" className="danger" onClick={() => onDelete(n)}>✕</button>
              </span>
            </div>
            <OutlineEditor nodes={n.children} selected={selected} onSelect={onSelect} onMove={onMove} onDelete={onDelete} onAdd={onAdd} />
          </li>
        );
      })}
    </ul>
  );
}

function AddNodeModal({ courseId, parent, kind, onClose, onAdded }: {
  courseId: number; parent: string; kind: 'page' | 'chapter'; onClose: () => void; onAdded: (path: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const r = await api.post<{ path: string }>(`/studio/courses/${courseId}/nodes`, { parent, kind, title });
      onAdded(r.path);
    } catch (err) {
      setError((err as Error).message);
    }
  }
  return (
    <Modal title={kind === 'chapter' ? (parent ? 'New sub-chapter' : 'New chapter') : 'New page'} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label>Title<input autoFocus required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <ErrorBox error={error} />
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary">Add</button>
        </div>
      </form>
    </Modal>
  );
}

function CourseSettings({ course, onSaved }: { course: CourseSummary; onSaved: () => void }) {
  const navigate = useNavigate();
  const [categories] = useLoad(() => api.get<Category[]>('/catalog/categories'), []);
  const [allTags] = useLoad(() => api.get<Tag[]>('/catalog/tags'), []);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [categoryId, setCategoryId] = useState(course.categoryId ? String(course.categoryId) : '');
  const [tags, setTags] = useState<string[]>(course.tags);
  const [tagText, setTagText] = useState('');
  const [published, setPublished] = useState(course.published);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(course.title); setDescription(course.description); setTags(course.tags); setPublished(course.published);
    setCategoryId(course.categoryId ? String(course.categoryId) : '');
  }, [course]);

  function addTag(value: string) {
    const t = value.trim().toLowerCase().replace(/,/g, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagText('');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const pending = tagText.trim() ? [...tags, tagText.trim().toLowerCase()] : tags;
      await api.put(`/studio/courses/${course.id}`, { title, description, categoryId: categoryId ? Number(categoryId) : null, tags: pending, published });
      setTagText('');
      setMessage('Saved.');
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function deleteCourse() {
    if (!confirm(`Delete the course "${course.title}" with all its pages and files? This can't be undone.`)) return;
    try {
      await api.del(`/studio/courses/${course.id}`);
      navigate('/studio');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form className="stack card" onSubmit={save}>
      <h2>Course settings</h2>
      <label>Title<input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label>Description <small className="muted">(shown in the catalog and above the table of contents)</small>
        <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label>Category
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— none —</option>
          {categoryOptions(categories ?? []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </label>
      <div>
        <div className="label">Tags</div>
        <div className="tag-input">
          {tags.map((t) => <span key={t} className="tag on">{t} <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>✕</button></span>)}
          <input list="all-tags" placeholder="Add a tag and press Enter" value={tagText} onChange={(e) => setTagText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagText); } }} />
          <datalist id="all-tags">{allTags?.filter((t) => !tags.includes(t.name)).map((t) => <option key={t.id} value={t.name} />)}</datalist>
        </div>
        <small className="muted">Like labels: a course can have any number of tags. New tags are created as you add them.</small>
      </div>
      <label className="check"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published (visible in the catalog)</label>
      <ErrorBox error={error} />
      {message && <div className="success">{message}</div>}
      <div className="row between">
        <button type="button" className="btn ghost danger" onClick={deleteCourse}>Delete course</button>
        <div className="row">
          <Link className="btn ghost" to={`/courses/${course.id}`}>Preview</Link>
          <button className="btn primary">Save</button>
        </div>
      </div>
    </form>
  );
}

function NodeEditor({ courseId, path, dirty, onSaved }: { courseId: number; path: string; dirty: RefObject<boolean>; onSaved: () => void }) {
  const [page, error, reload] = useLoad(() => api.get<PageView>(`/studio/courses/${courseId}/nodes/${enc(path)}`), [courseId, path]);
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [mode, setMode] = useState<'split' | 'write' | 'preview'>('split');
  const [status, setStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (page) { setTitle(page.title); setMarkdown(page.markdown); dirty.current = false; }
  }, [page, dirty]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (error) return <ErrorBox error={error} />;
  if (!page) return <p className="muted">Loading…</p>;

  const changed = title !== page.title || markdown !== page.markdown;
  dirty.current = changed;

  async function save() {
    setSaveError(null);
    try {
      await api.put(`/studio/courses/${courseId}/nodes/${enc(path)}`, { title, markdown });
      setStatus('Saved ' + new Date().toLocaleTimeString());
      dirty.current = false;
      reload();
      onSaved();
    } catch (e) {
      setSaveError((e as Error).message);
    }
  }

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f, f.name));
    setUploading(true);
    setSaveError(null);
    try {
      await api.upload(`/studio/courses/${courseId}/files/${enc(path)}`, form);
      reload();
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(name: string) {
    if (!confirm(`Delete the file ${name}?`)) return;
    try {
      await api.del(`/studio/courses/${courseId}/files/${enc(path)}?name=${encodeURIComponent(name)}`);
      reload();
    } catch (e) {
      setSaveError((e as Error).message);
    }
  }

  return (
    <div className="editor card" onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (changed) save(); } }}>
      <div className="row between">
        <span className="pill">{page.kind === 'chapter' ? 'Chapter' : 'Page'}</span>
        <div className="seg">
          {(['write', 'split', 'preview'] as const).map((m) => <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m[0].toUpperCase() + m.slice(1)}</button>)}
        </div>
      </div>
      <input className="title-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} aria-label="Title" />
      <div className={`md-editor ${mode}`}>
        {mode !== 'preview' && (
          <textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} spellCheck
            placeholder={page.kind === 'chapter' ? 'An introduction to this chapter (Markdown)…' : 'Write the lesson in Markdown…'} />
        )}
        {mode !== 'write' && <div className="md-preview"><h1>{title}</h1><Markdown text={markdown} /></div>}
      </div>
      <ErrorBox error={saveError} />
      <div className="row between">
        <span className="muted small">{changed ? 'Unsaved changes' : status ?? `Last updated ${new Date(page.updatedAt).toLocaleString()}`}</span>
        <button className="btn primary" disabled={!changed} onClick={save}>Save <small>(Ctrl+S)</small></button>
      </div>
      <hr />
      <FileList files={page.files} urlOf={(name) => fileUrl(courseId, path, name)} onDelete={deleteFile} />
      <label className="upload">
        <input type="file" multiple onChange={(e) => { upload(e.target.files); e.target.value = ''; }} disabled={uploading} />
        <span className="btn">{uploading ? 'Uploading…' : '＋ Attach files'}</span>
        <small className="muted">Sample code, data, images… (stored in this page's note files)</small>
      </label>
    </div>
  );
}
