import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([]);

  function change(delta) {
    setCount((c) => c + delta);              // updater: safe even if called several times
    setHistory((h) => [...h, delta].slice(-5)); // a new array, never h.push()
  }

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <h2>{count}</h2>
      <label>
        Step:{' '}
        <input type="number" value={step} min={1} onChange={(e) => setStep(Number(e.target.value) || 1)} />
      </label>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={() => change(-step)}>−{step}</button>
        <button onClick={() => change(step)}>+{step}</button>
        <button onClick={() => { setCount(0); setHistory([]); }}>Reset</button>
      </div>
      {history.length > 0 && <p>Last changes: {history.map((d) => (d > 0 ? `+${d}` : d)).join(', ')}</p>}
    </div>
  );
}
