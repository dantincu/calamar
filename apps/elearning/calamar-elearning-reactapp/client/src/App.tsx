import type { ReactNode } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router';
import { roleLabel, type Role } from './api';
import { useAuth } from './auth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPage from './pages/ForgotPage';
import CatalogPage from './pages/CatalogPage';
import CoursePage from './pages/CoursePage';
import ReaderPage from './pages/ReaderPage';
import MyCoursesPage from './pages/MyCoursesPage';
import StudioPage from './pages/StudioPage';
import StudioCoursePage from './pages/StudioCoursePage';
import AdminPage from './pages/AdminPage';

function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Header() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <img src="/favicon.svg" alt="" width={28} height={28} />
        <span>Calamar <b>e-learning</b></span>
      </Link>
      <nav>
        <NavLink to="/" end>Catalog</NavLink>
        {user.role === 'enduser' && <NavLink to="/my">My courses</NavLink>}
        {user.role === 'creator' && <NavLink to="/studio">Studio</NavLink>}
        {user.role === 'admin' && <NavLink to="/admin">Administration</NavLink>}
      </nav>
      <div className="userbox">
        <span className="who" title={roleLabel[user.role]}>
          {user.email} <small>{roleLabel[user.role]}</small>
        </span>
        <Link to={`/forgot?email=${encodeURIComponent(user.email)}`} className="btn ghost small">Change password</Link>
        <button className="btn ghost small" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  return (
    <>
      <Header />
      <main className={user ? 'app-main' : 'app-main bare'}>
        <Routes>
          <Route path="/login" element={!loading && user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={!loading && user ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route path="/forgot" element={<ForgotPage />} />
          <Route path="/" element={<RequireAuth><CatalogPage /></RequireAuth>} />
          <Route path="/courses/:id" element={<RequireAuth><CoursePage /></RequireAuth>} />
          <Route path="/courses/:id/learn/*" element={<RequireAuth><ReaderPage /></RequireAuth>} />
          <Route path="/my" element={<RequireAuth roles={['enduser']}><MyCoursesPage /></RequireAuth>} />
          <Route path="/studio" element={<RequireAuth roles={['creator']}><StudioPage /></RequireAuth>} />
          <Route path="/studio/:id/*" element={<RequireAuth roles={['creator']}><StudioCoursePage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminPage /></RequireAuth>} />
          <Route path="*" element={<div className="center"><h2>Page not found</h2><Link to="/">Back to the catalog</Link></div>} />
        </Routes>
      </main>
    </>
  );
}
