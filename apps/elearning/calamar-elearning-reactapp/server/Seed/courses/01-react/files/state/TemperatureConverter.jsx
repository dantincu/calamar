import { useState } from 'react';

const toF = (c) => (c * 9) / 5 + 32;
const toC = (f) => ((f - 32) * 5) / 9;
const round = (n) => Math.round(n * 100) / 100;

function TemperatureInput({ label, value, onChange }) {
  return (
    <label style={{ display: 'block', margin: '8px 0' }}>
      {label}{' '}
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Verdict({ celsius }) {
  if (celsius === '') return null;
  return <p>{celsius >= 100 ? 'The water would boil.' : celsius <= 0 ? 'The water would freeze.' : 'Liquid water.'}</p>;
}

export default function TemperatureConverter() {
  // The single source of truth: Celsius. Fahrenheit is derived from it.
  const [celsius, setCelsius] = useState('');
  const fahrenheit = celsius === '' ? '' : round(toF(Number(celsius)));

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <TemperatureInput label="Celsius" value={celsius} onChange={setCelsius} />
      <TemperatureInput
        label="Fahrenheit"
        value={fahrenheit}
        onChange={(f) => setCelsius(f === '' ? '' : round(toC(Number(f))))}
      />
      <Verdict celsius={celsius === '' ? '' : Number(celsius)} />
    </div>
  );
}
