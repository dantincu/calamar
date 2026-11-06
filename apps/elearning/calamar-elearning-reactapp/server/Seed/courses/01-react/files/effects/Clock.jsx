import { useEffect, useState } from 'react';

function Clock({ timeZone }) {
  const [now, setNow] = useState(() => new Date());

  // Subscribe to an external system (a timer) and clean up.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Synchronize the document title with the selected zone.
  useEffect(() => {
    document.title = `Time in ${timeZone}`;
  }, [timeZone]);

  // Derived during render: no effect needed.
  const text = now.toLocaleTimeString('en-GB', { timeZone });
  return <p style={{ fontSize: 40, fontVariantNumeric: 'tabular-nums' }}>{text}</p>;
}

export default function WorldClock() {
  const [zone, setZone] = useState('Europe/Bucharest');
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <select value={zone} onChange={(e) => setZone(e.target.value)}>
        <option>Europe/Bucharest</option>
        <option>America/New_York</option>
        <option>Asia/Tokyo</option>
      </select>{' '}
      <button onClick={() => setVisible((v) => !v)}>{visible ? 'Hide' : 'Show'} clock</button>
      {/* Hiding unmounts Clock, which runs its cleanup and stops the timer. */}
      {visible && <Clock timeZone={zone} />}
    </div>
  );
}
