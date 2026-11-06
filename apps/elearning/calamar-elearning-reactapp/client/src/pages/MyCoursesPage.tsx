import { Link } from 'react-router';
import { api, type CourseSummary } from '../api';
import { CourseCard, ErrorBox, useLoad } from '../components/ui';

export default function MyCoursesPage() {
  const [courses, error] = useLoad(() => api.get<CourseSummary[]>('/courses/subscribed'), []);
  return (
    <div>
      <h1>My courses</h1>
      <ErrorBox error={error} />
      {courses && courses.length === 0 && (
        <div className="empty">You haven't subscribed to any course yet. <Link to="/">Browse the catalog</Link>.</div>
      )}
      <div className="grid">{courses?.map((c) => <CourseCard key={c.id} course={c} />)}</div>
    </div>
  );
}
