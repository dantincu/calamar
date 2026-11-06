In a **controlled input**, React state is the single source of truth for the input's value.

```jsx
const [email, setEmail] = useState('');

<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

Every keystroke updates state, and state drives the input. This makes validation, formatting and resetting trivial.

## One state object for a whole form

```jsx
const [form, setForm] = useState({ name: '', email: '', plan: 'free', terms: false });

function handleChange(e) {
  const { name, value, type, checked } = e.target;
  setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
}

<input name="name" value={form.name} onChange={handleChange} />
<input name="terms" type="checkbox" checked={form.terms} onChange={handleChange} />
```

## Submitting

```jsx
function handleSubmit(e) {
  e.preventDefault();    // no page reload
  if (!form.terms) return setError('Please accept the terms.');
  save(form);
}

<form onSubmit={handleSubmit}>…<button type="submit">Sign up</button></form>
```

Using `onSubmit` on the form (rather than `onClick` on the button) also handles pressing Enter.

## Derived values

Don't store what you can compute. Validation messages, for example, can be calculated on each render:

```jsx
const emailError = form.email && !form.email.includes('@') ? 'Invalid e-mail' : null;
```

## Uncontrolled inputs

Sometimes you only need the value at submit time; then you can read it from the form with `new FormData(e.target)`. Controlled inputs are more common in React apps because they allow instant feedback.

The attached `SignupForm.jsx` is a complete form with validation.
