import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import type { Category, CourseSummary } from '../api';

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <img src="/favicon.svg" alt="" width={40} height={40} />
          <div>
            {subtitle && <div className="muted small">{subtitle}</div>}
            <h1>{title}</h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorBox({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  return <div className="error" role="alert">{error}</div>;
}

/** Loads data with an effect; returns [data, error, reload]. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): [T | null, string | null, () => void, (t: T) => void] {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let ignore = false;
    setError(null);
    load().then((d) => { if (!ignore) setData(d); }).catch((e) => { if (!ignore) setError((e as Error).message); });
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return [data, error, () => setTick((t) => t + 1), setData];
}

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-card-top">
        <span className="crumbs">{course.categoryPath.join(' › ') || 'Uncategorized'}</span>
        {course.subscribed && <span className="pill ok">Subscribed</span>}
      </div>
      <h3>{course.title}</h3>
      <p className="desc">{course.description}</p>
      <div className="tags">{course.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      <div className="course-card-foot muted small">
        <span>by {course.creatorEmail}</span>
        <span>{course.subscriberCount} learner{course.subscriberCount === 1 ? '' : 's'}</span>
      </div>
    </Link>
  );
}

export interface CategoryNode extends Category { children: CategoryNode[] }

export function buildTree(categories: Category[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>(categories.map((c) => [c.id, { ...c, children: [] }]));
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId != null ? byId.get(node.parentId) : undefined;
    (parent ? parent.children : roots).push(node);
  }
  const sort = (list: CategoryNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    list.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

export function totalCourses(n: CategoryNode): number {
  return n.courseCount + n.children.reduce((s, c) => s + totalCourses(c), 0);
}

/** Category names as "A › B › C", for selects. */
export function categoryOptions(categories: Category[]): { id: number; label: string }[] {
  const out: { id: number; label: string }[] = [];
  const walk = (nodes: CategoryNode[], prefix: string) => nodes.forEach((n) => {
    const label = prefix ? `${prefix} › ${n.name}` : n.name;
    out.push({ id: n.id, label });
    walk(n.children, label);
  });
  walk(buildTree(categories), '');
  return out;
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><button className="btn ghost small" onClick={onClose} aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  );
}
