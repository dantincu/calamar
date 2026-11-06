import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { api, type User } from '../api';
import { useAuth } from '../auth';
import { AuthCard, ErrorBox } from '../components/ui';

/** "Forgot password" — also how a signed-in person changes their password. */
export default function ForgotPage() {
  const [params] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(f: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try { await f(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  function send(e?: FormEvent) {
    e?.preventDefault();
    run(async () => {
      await api.post('/auth/forgot', { email });
      setSent(true);
    });
  }

  function reset(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError('The two passwords are different.');
    run(async () => {
      const u = await api.post<User>('/auth/reset', { email, code, password });
      setUser(u);
      navigate('/', { replace: true });
    });
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Calamar e-learning">
      {!sent ? (
        <form onSubmit={send} className="stack">
          <p className="muted">We will send a code to your e-mail address. Enter it on the next screen to choose a new password.</p>
          <label>E-mail address
            <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </label>
          <ErrorBox error={error} />
          <button className="btn primary" disabled={busy}>Send me a code</button>
          <p className="small"><Link to="/login">Back to sign in</Link></p>
        </form>
      ) : (
        <form onSubmit={reset} className="stack">
          <div className="notice">If an account exists for <b>{email}</b>, a 6-digit code was sent to it. It is valid for 15 minutes.</div>
          <label>Code from the e-mail
            <input className="code" inputMode="numeric" autoComplete="one-time-code" required autoFocus maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          </label>
          <label>New password <small className="muted">(at least 8 characters)</small>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
          <label>Repeat the password
            <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </label>
          <ErrorBox error={error} />
          <button className="btn primary" disabled={busy || code.length !== 6}>Save the new password</button>
          <p className="small">Didn't get it? <button type="button" className="link" onClick={() => send()} disabled={busy}>Send a new code</button></p>
        </form>
      )}
    </AuthCard>
  );
}
