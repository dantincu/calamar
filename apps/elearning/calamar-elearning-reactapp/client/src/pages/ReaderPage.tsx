import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api, enc, fileUrl, flatten, type CourseDetails, type PageView } from '../api';
import { FileList, Markdown, Outline } from '../components/content';
import { ErrorBox, useLoad } from '../components/ui';

export default function ReaderPage() {
  const { id, '*': path = '' } = useParams();
  const courseId = Number(id);
  const [data, error] = useLoad(() => api.get<CourseDetails>(`/courses/${courseId}`), [courseId]);
  const [page, pageError] = useLoad(() => api.get<PageView>(`/courses/${courseId}/pages/${enc(path)}`), [courseId, path]);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); setTocOpen(false); }, [path]);

  if (error) return <ErrorBox error={error} />;
  if (!data) return <p className="muted">Loading…</p>;

  const flat = flatten(data.outline);
  const i = flat.findIndex((n) => n.path === path);
  const prev = i > 0 ? flat[i - 1] : null;
  const next = i >= 0 && i < flat.length - 1 ? flat[i + 1] : null;
  const current = flat[i];
  const children = current?.children ?? [];
  const to = (p: string) => `/courses/${courseId}/learn/${enc(p)}`;

  return (
    <div className="reader">
      <aside className={tocOpen ? 'reader-toc open' : 'reader-toc'}>
        <Link to={`/courses/${courseId}`} className="toc-title">{data.course.title}</Link>
        <Outline nodes={data.outline} linkTo={(n) => to(n.path)} active={path} />
      </aside>
      <article className="reader-main">
        <button className="btn ghost small toc-toggle" onClick={() => setTocOpen(!tocOpen)}>☰ Contents</button>
        <div className="progress"><div style={{ width: `${flat.length ? ((i + 1) / flat.length) * 100 : 0}%` }} /></div>
        <ErrorBox error={pageError} />
        {page && page.path === path && (
          <>
            <div className="muted small">{page.kind === 'chapter' ? 'Chapter' : 'Page'} · step {i + 1} of {flat.length}</div>
            <h1>{page.title}</h1>
            <Markdown text={page.markdown} />
            {page.kind === 'chapter' && children.length > 0 && (
              <div className="card subtle">
                <h4>In this chapter</h4>
                <Outline nodes={children} linkTo={(n) => to(n.path)} numbered={false} />
              </div>
            )}
            <FileList files={page.files} urlOf={(name) => fileUrl(courseId, page.path, name)} />
          </>
        )}
        <nav className="pager">
          {prev ? <Link className="btn ghost" to={to(prev.path)}>← {prev.title}</Link> : <span />}
          {next ? <Link className="btn primary" to={to(next.path)}>{next.title} →</Link> : <Link className="btn" to={`/courses/${courseId}`}>Finish ✓</Link>}
        </nav>
      </article>
    </div>
  );
}
