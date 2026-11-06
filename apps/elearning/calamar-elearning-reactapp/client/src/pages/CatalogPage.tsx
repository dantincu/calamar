import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { api, type Category, type CourseSummary, type Tag } from '../api';
import { buildTree, CourseCard, ErrorBox, totalCourses, useLoad, type CategoryNode } from '../components/ui';

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const categoryId = params.get('category');
  const tag = params.get('tag');
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);

  const [categories] = useLoad(() => api.get<Category[]>('/catalog/categories'), []);
  const [tags] = useLoad(() => api.get<Tag[]>('/catalog/tags'), []);
  const [courses, error] = useLoad(() => {
    const s = new URLSearchParams();
    if (q) s.set('q', q);
    if (categoryId) s.set('categoryId', categoryId);
    if (tag) s.set('tag', tag);
    return api.get<CourseSummary[]>('/courses?' + s.toString());
  }, [q, categoryId, tag]);

  const tree = useMemo(() => buildTree(categories ?? []), [categories]);
  const selected = categories?.find((c) => String(c.id) === categoryId);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next);
  }

  // Debounced search as you type.
  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => update({ q: text.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="catalog">
      <aside className="sidebar">
        <h4>Categories</h4>
        <button className={!categoryId ? 'cat-item active' : 'cat-item'} onClick={() => update({ category: null })}>All courses</button>
        <CategoryTree nodes={tree} selected={categoryId} onSelect={(id) => update({ category: String(id) })} />
        {tags && tags.some((t) => t.courseCount > 0) && (
          <>
            <h4>Tags</h4>
            <div className="tags">
              {tags.filter((t) => t.courseCount > 0).map((t) => (
                <button key={t.id} className={tag === t.name ? 'tag on' : 'tag'} onClick={() => update({ tag: tag === t.name ? null : t.name })}>
                  {t.name} <small>{t.courseCount}</small>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      <section className="content">
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); update({ q: text.trim() || null }); }}>
          <input type="search" placeholder="Search courses, chapters, topics…" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn primary">Search</button>
        </form>
        <div className="filters">
          {selected && <span className="chip">Category: {selected.name} <button onClick={() => update({ category: null })} aria-label="Remove">✕</button></span>}
          {tag && <span className="chip">Tag: {tag} <button onClick={() => update({ tag: null })} aria-label="Remove">✕</button></span>}
          {q && <span className="chip">“{q}” <button onClick={() => update({ q: null })} aria-label="Remove">✕</button></span>}
        </div>
        <ErrorBox error={error} />
        {!courses && !error && <p className="muted">Loading…</p>}
        {courses && courses.length === 0 && <div className="empty">No courses match. Try another category or search.</div>}
        <div className="grid">
          {courses?.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>
    </div>
  );
}

function CategoryTree({ nodes, selected, onSelect }: { nodes: CategoryNode[]; selected: string | null; onSelect: (id: number) => void }) {
  return (
    <ul className="cat-tree">
      {nodes.map((n) => <CategoryItem key={n.id} node={n} selected={selected} onSelect={onSelect} />)}
    </ul>
  );
}

function CategoryItem({ node, selected, onSelect }: { node: CategoryNode; selected: string | null; onSelect: (id: number) => void }) {
  const [open, setOpen] = useState(true);
  const count = totalCourses(node);
  return (
    <li>
      <div className="cat-row">
        {node.children.length > 0
          ? <button className="twisty" onClick={() => setOpen(!open)} aria-label={open ? 'Collapse' : 'Expand'}>{open ? '▾' : '▸'}</button>
          : <span className="twisty" />}
        <button className={String(node.id) === selected ? 'cat-item active' : 'cat-item'} onClick={() => onSelect(node.id)}>
          {node.name} {count > 0 && <small>{count}</small>}
        </button>
      </div>
      {open && node.children.length > 0 && <CategoryTree nodes={node.children} selected={selected} onSelect={onSelect} />}
    </li>
  );
}
