import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { api, type User } from '../api';
import { useAuth } from '../auth';
import { AuthCard, ErrorBox } from '../components/ui';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [role, setRole] = useState<'enduser' | 'creator'>('enduser');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError('The two passwords are different.');
    setError(null);
    setBusy(true);
    try {
      const u = await api.post<User>('/auth/register', { email, password, role });
      setUser(u);
      navigate(u.role === 'creator' ? '/studio' : '/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Create an account" subtitle="Calamar e-learning">
      <form onSubmit={submit} className="stack">
        <label>E-mail address
          <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </label>
        <fieldset className="choice">
          <legend>I want to</legend>
          <label className={role === 'enduser' ? 'option on' : 'option'}>
            <input type="radio" name="role" checked={role === 'enduser'} onChange={() => setRole('enduser')} />
            <span><b>Learn</b><small>Browse the catalog and subscribe to courses</small></span>
          </label>
          <label className={role === 'creator' ? 'option on' : 'option'}>
            <input type="radio" name="role" checked={role === 'creator'} onChange={() => setRole('creator')} />
            <span><b>Teach</b><small>Publish and maintain my own courses</small></span>
          </label>
        </fieldset>
        <label>Password <small className="muted">(at least 8 characters)</small>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </label>
        <label>Repeat the password
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </label>
        <ErrorBox error={error} />
        <button className="btn primary" disabled={busy}>Create account</button>
        <p className="muted small">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </AuthCard>
  );
}
