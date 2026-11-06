import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { api, roleLabel, type Role, type User } from '../api';
import { useAuth } from '../auth';
import { AuthCard, ErrorBox } from '../components/ui';

type Step = 'email' | 'password' | 'initial' | 'unknown';

export default function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(f: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try { await f(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  const done = (u: User) => { setUser(u); navigate(from, { replace: true }); };

  function submitEmail(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      const r = await api.post<{ exists: boolean; needsPassword: boolean; role: Role | null }>('/auth/check', { email });
      setRole(r.role);
      setStep(!r.exists ? 'unknown' : r.needsPassword ? 'initial' : 'password');
    });
  }

  function submitPassword(e: FormEvent) {
    e.preventDefault();
    run(async () => done(await api.post<User>('/auth/login', { email, password })));
  }

  function submitInitial(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError('The two passwords are different.');
    run(async () => done(await api.post<User>('/auth/initial-password', { email, password })));
  }

  const back = () => { setStep('email'); setPassword(''); setConfirm(''); setError(null); };

  return (
    <AuthCard title="Sign in" subtitle="Calamar e-learning">
      {step === 'email' && (
        <form onSubmit={submitEmail} className="stack">
          <label>E-mail address
            <input type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </label>
          <ErrorBox error={error} />
          <button className="btn primary" disabled={busy}>Continue</button>
          <p className="muted small">New here? <Link to="/register">Create an account</Link></p>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={submitPassword} className="stack">
          <p className="identity">{email} {role && <span className="pill">{roleLabel[role]}</span>} <button type="button" className="link" onClick={back}>change</button></p>
          <label>Password
            <input type="password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          <ErrorBox error={error} />
          <button className="btn primary" disabled={busy}>Sign in</button>
          <p className="small"><Link to={`/forgot?email=${encodeURIComponent(email)}`}>Forgot password?</Link></p>
        </form>
      )}

      {step === 'initial' && (
        <form onSubmit={submitInitial} className="stack">
          <p className="identity">{email} {role && <span className="pill">{roleLabel[role]}</span>} <button type="button" className="link" onClick={back}>change</button></p>
          <div className="notice">This is the first sign-in of this account. Choose its password (at least 8 characters).</div>
          <label>New password
            <input type="password" autoFocus required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
          <label>Repeat the password
            <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </label>
          <ErrorBox error={error} />
          <button className="btn primary" disabled={busy}>Set password and sign in</button>
        </form>
      )}

      {step === 'unknown' && (
        <div className="stack">
          <p>There is no account for <b>{email}</b>.</p>
          <Link className="btn primary" to={`/register?email=${encodeURIComponent(email)}`}>Create an account</Link>
          <button className="btn ghost" onClick={back}>Use another address</button>
        </div>
      )}
    </AuthCard>
  );
}
