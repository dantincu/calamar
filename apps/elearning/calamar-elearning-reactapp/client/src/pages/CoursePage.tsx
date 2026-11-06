import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api, enc, flatten, type CourseDetails } from '../api';
import { useAuth } from '../auth';
import { Outline } from '../components/content';
import { ErrorBox, useLoad } from '../components/ui';

export default function CoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, error, reload] = useLoad(() => api.get<CourseDetails>(`/courses/${id}`), [id]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) return <ErrorBox error={error} />;
  if (!data) return <p className="muted">Loading…</p>;
  const { course, outline, canRead, isCreator } = data;
  const first = flatten(outline)[0];
  const pages = flatten(outline).filter((n) => n.kind === 'page').length;

  async function subscribe(on: boolean) {
    setBusy(true);
    setActionError(null);
    try {
      if (on) await api.post(`/courses/${id}/subscription`);
      else await api.del(`/courses/${id}/subscription`);
      reload();
      if (on && first) navigate(`/courses/${id}/learn/${enc(first.path)}`);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="course-page">
      <div className="hero">
        <div className="crumbs">
          <Link to="/">Catalog</Link>
          {course.categoryPath.map((c) => <span key={c}> › {c}</span>)}
        </div>
        <h1>{course.title}</h1>
        <p className="lead">{course.description}</p>
        <div className="tags">{course.tags.map((t) => <Link key={t} className="tag" to={`/?tag=${encodeURIComponent(t)}`}>{t}</Link>)}</div>
        <p className="muted small">
          by {course.creatorEmail} · {pages} pages · {course.subscriberCount} learner{course.subscriberCount === 1 ? '' : 's'}
          {!course.published && <> · <span className="pill warn">Draft</span></>}
        </p>
        <div className="actions">
          {canRead && first && <Link className="btn primary" to={`/courses/${id}/learn/${enc(first.path)}`}>{course.subscribed ? 'Continue learning' : 'Open the course'}</Link>}
          {user?.role === 'enduser' && !course.subscribed && <button className="btn primary" disabled={busy} onClick={() => subscribe(true)}>Subscribe to this course</button>}
          {user?.role === 'enduser' && course.subscribed && <button className="btn ghost" disabled={busy} onClick={() => subscribe(false)}>Unsubscribe</button>}
          {isCreator && <Link className="btn" to={`/studio/${id}`}>Edit in the studio</Link>}
        </div>
        <ErrorBox error={actionError} />
      </div>
      <div className="card">
        <h2>Table of contents</h2>
        <Outline nodes={outline} linkTo={canRead ? (n) => `/courses/${id}/learn/${enc(n.path)}` : undefined} />
        {!canRead && user?.role === 'enduser' && <p className="muted small">Subscribe to read the pages and download their files.</p>}
      </div>
    </div>
  );
}
