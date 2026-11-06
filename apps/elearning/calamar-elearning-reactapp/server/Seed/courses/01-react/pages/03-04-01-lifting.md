When two components must stay in sync, move the state to their **closest common parent** and pass it down as props, together with functions to change it.

## Before: two independent inputs

```jsx
function CelsiusInput() {
  const [c, setC] = useState('');
  return <input value={c} onChange={(e) => setC(e.target.value)} />;
}
function FahrenheitInput() { /* its own state — never in sync */ }
```

## After: the parent owns the state

```jsx
function Converter() {
  const [celsius, setCelsius] = useState('');
  const fahrenheit = celsius === '' ? '' : (celsius * 9) / 5 + 32;

  return (
    <>
      <TemperatureInput label="°C" value={celsius} onChange={setCelsius} />
      <TemperatureInput label="°F" value={fahrenheit}
        onChange={(f) => setCelsius(f === '' ? '' : ((f - 32) * 5) / 9)} />
    </>
  );
}

function TemperatureInput({ label, value, onChange }) {
  return (
    <label>
      {label} <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
```

`TemperatureInput` is now a **controlled component**: it has no state of its own and is fully driven by its props.

## A single source of truth

For each piece of data, decide which component *owns* it. Everyone else receives it as props. Notice that Fahrenheit isn't stored at all — it is derived from Celsius.

The full example is in the attached `TemperatureConverter.jsx`.
