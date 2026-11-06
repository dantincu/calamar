import { useMemo, useState, type FormEvent } from 'react';
import { api, roleLabel, type Category, type Role, type Tag } from '../api';
import { buildTree, categoryOptions, ErrorBox, Modal, useLoad, type CategoryNode } from '../components/ui';

interface AdminUser { id: number; email: string; role: Role; hasPassword: boolean; createdAt: string }

export default function AdminPage() {
  const [tab, setTab] = useState<'categories' | 'tags' | 'users'>('categories');
  return (
    <div>
      <h1>Administration</h1>
      <div className="tabs">
        <button className={tab === 'categories' ? 'on' : ''} onClick={() => setTab('categories')}>Course categories</button>
        <button className={tab === 'tags' ? 'on' : ''} onClick={() => setTab('tags')}>Course tags</button>
        <button className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>Accounts</button>
      </div>
      {tab === 'categories' && <Categories />}
      {tab === 'tags' && <Tags />}
      {tab === 'users' && <Users />}
    </div>
  );
}

type Dialog =
  | { kind: 'add'; parent: CategoryNode | null }
  | { kind: 'rename'; node: CategoryNode }
  | { kind: 'move'; node: CategoryNode };

function Categories() {
  const [categories, error, reload] = useLoad(() => api.get<Category[]>('/catalog/categories'), []);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const tree = useMemo(() => buildTree(categories ?? []), [categories]);

  async function act(f: () => Promise<unknown>) {
    setActionError(null);
    try { await f(); reload(); } catch (e) { setActionError((e as Error).message); }
  }

  const remove = (n: CategoryNode) => {
    const extra = n.children.length ? ' and all its sub-categories' : '';
    if (confirm(`Delete the category "${n.name}"${extra}? Courses in it will become uncategorized.`))
      act(() => api.del(`/catalog/categories/${n.id}`));
  };

  function render(nodes: CategoryNode[]) {
    return (
      <ul className="admin-tree">
        {nodes.map((n, i) => (
          <li key={n.id}>
            <div className="tree-row">
              <span className="tree-title">📂 {n.name} {n.courseCount > 0 && <small className="muted">({n.courseCount} published)</small>}</span>
              <span className="tree-actions">
                <button title="Move up" disabled={i === 0} onClick={() => act(() => api.post(`/catalog/categories/${n.id}/move`, { direction: -1 }))}>↑</button>
                <button title="Move down" disabled={i === nodes.length - 1} onClick={() => act(() => api.post(`/catalog/categories/${n.id}/move`, { direction: 1 }))}>↓</button>
                <button title="Add a sub-category" onClick={() => setDialog({ kind: 'add', parent: n })}>＋</button>
                <button title="Rename" onClick={() => setDialog({ kind: 'rename', node: n })}>✎</button>
                <button title="Move to another parent" onClick={() => setDialog({ kind: 'move', node: n })}>⇄</button>
                <button title="Delete" className="danger" onClick={() => remove(n)}>✕</button>
              </span>
            </div>
            {n.children.length > 0 && render(n.children)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="card">
      <div className="row between">
        <p className="muted">The hierarchy learners browse in the catalog. Each course belongs to at most one category.</p>
        <button className="btn primary" onClick={() => setDialog({ kind: 'add', parent: null })}>＋ Top-level category</button>
      </div>
      <ErrorBox error={error ?? actionError} />
      {categories && (tree.length ? render(tree) : <p className="muted">No categories yet.</p>)}
      {dialog && <CategoryDialog dialog={dialog} categories={categories ?? []} onClose={() => setDialog(null)} onDone={() => { setDialog(null); reload(); }} />}
    </div>
  );
}

function CategoryDialog({ dialog, categories, onClose, onDone }: { dialog: Dialog; categories: Category[]; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(dialog.kind === 'rename' ? dialog.node.name : '');
  const [parent, setParent] = useState(dialog.kind === 'move' && dialog.node.parentId ? String(dialog.node.parentId) : '');
  const [error, setError] = useState<string | null>(null);

  // A category can't move inside itself.
  const excluded = useMemo(() => {
    if (dialog.kind !== 'move') return new Set<number>();
    const ids = new Set<number>();
    const walk = (n: CategoryNode) => { ids.add(n.id); n.children.forEach(walk); };
    walk(dialog.node);
    return ids;
  }, [dialog]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      if (dialog.kind === 'add') await api.post('/catalog/categories', { name, parentId: dialog.parent?.id ?? null });
      if (dialog.kind === 'rename') await api.put(`/catalog/categories/${dialog.node.id}`, { name });
      if (dialog.kind === 'move') await api.put(`/catalog/categories/${dialog.node.id}`, { parentId: parent ? Number(parent) : null, changeParent: true });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const title = dialog.kind === 'add' ? (dialog.parent ? `New category in "${dialog.parent.name}"` : 'New top-level category')
    : dialog.kind === 'rename' ? `Rename "${dialog.node.name}"` : `Move "${dialog.node.name}"`;

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        {dialog.kind !== 'move'
          ? <label>Name<input autoFocus required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
          : (
            <label>New parent
              <select value={parent} onChange={(e) => setParent(e.target.value)}>
                <option value="">— top level —</option>
                {categoryOptions(categories).filter((o) => !excluded.has(o.id)).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
          )}
        <ErrorBox error={error} />
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function Tags() {
  const [tags, error, reload] = useLoad(() => api.get<Tag[]>('/catalog/tags'), []);
  const [name, setName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  async function act(f: () => Promise<unknown>) {
    setActionError(null);
    try { await f(); reload(); } catch (e) { setActionError((e as Error).message); }
  }

  return (
    <div className="card">
      <p className="muted">Tags work like labels: a course can have any number of them. Content creators create tags as they tag their courses; here you can add, rename and delete them.</p>
      <form className="row" onSubmit={(e) => { e.preventDefault(); act(async () => { await api.post('/catalog/tags', { name }); setName(''); }); }}>
        <input placeholder="New tag" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
        <button className="btn primary">Add tag</button>
      </form>
      <ErrorBox error={error ?? actionError} />
      <table className="table">
        <thead><tr><th>Tag</th><th>Published courses</th><th /></tr></thead>
        <tbody>
          {tags?.map((t) => (
            <tr key={t.id}>
              <td><span className="tag">{t.name}</span></td>
              <td>{t.courseCount}</td>
              <td className="right">
                <button className="btn ghost small" onClick={() => {
                  const n = prompt('Rename the tag', t.name);
                  if (n && n !== t.name) act(() => api.put(`/catalog/tags/${t.id}`, { name: n }));
                }}>Rename</button>{' '}
                <button className="btn ghost small danger" onClick={() => {
                  if (confirm(`Delete the tag "${t.name}"? It will be removed from every course.`)) act(() => api.del(`/catalog/tags/${t.id}`));
                }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Users() {
  const [users, error] = useLoad(() => api.get<AdminUser[]>('/admin/users'), []);
  return (
    <div className="card">
      <p className="muted">Content creators and learners create their own accounts. Accounts that never signed in have no password yet.</p>
      <ErrorBox error={error} />
      <table className="table">
        <thead><tr><th>E-mail</th><th>Role</th><th>Password</th><th>Created</th></tr></thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{roleLabel[u.role]}</td>
              <td>{u.hasPassword ? <span className="pill ok">Set</span> : <span className="pill warn">Not yet</span>}</td>
              <td className="muted small">{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
