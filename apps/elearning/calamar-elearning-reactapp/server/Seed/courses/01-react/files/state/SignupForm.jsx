import { useState } from 'react';

const initial = { name: '', email: '', password: '', plan: 'free', terms: false };

export default function SignupForm() {
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  // Derived: computed on every render, never stored in state.
  const errors = {
    name: form.name.trim() ? null : 'Name is required',
    email: /^\S+@\S+\.\S+$/.test(form.email) ? null : 'Enter a valid e-mail',
    password: form.password.length >= 8 ? null : 'At least 8 characters',
    terms: form.terms ? null : 'You must accept the terms',
  };
  const valid = Object.values(errors).every((e) => e === null);

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, terms: true });
    if (!valid) return;
    setSubmitted({ ...form, password: '••••••••' });
    setForm(initial);
    setTouched({});
  }

  const show = (field) => touched[field] && errors[field] && <small style={{ color: 'crimson' }}> {errors[field]}</small>;
  const blur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
      <label>Name <input name="name" value={form.name} onChange={handleChange} onBlur={blur} />{show('name')}</label>
      <label>E-mail <input name="email" value={form.email} onChange={handleChange} onBlur={blur} />{show('email')}</label>
      <label>Password <input name="password" type="password" value={form.password} onChange={handleChange} onBlur={blur} />{show('password')}</label>
      <label>
        Plan{' '}
        <select name="plan" value={form.plan} onChange={handleChange}>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      </label>
      <label><input name="terms" type="checkbox" checked={form.terms} onChange={handleChange} /> I accept the terms{show('terms')}</label>
      <button type="submit">Sign up</button>
      {submitted && <pre>{JSON.stringify(submitted, null, 2)}</pre>}
    </form>
  );
}
