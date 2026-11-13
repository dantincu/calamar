import { Link } from 'react-router';
import { ENGINES } from '../engines/registry';

export function HomePage() {
  return (
    <main className="home">
      <section className="home-hero">
        <h1>Calamar Multiverse</h1>
        <p>
          A collection of explorable worlds. In each one you pilot a small drone in first person: hover in place, creep along at a snail&apos;s
          pace, or cross the map at several times the speed of sound.
        </p>
      </section>
      <section className="engine-grid">
        {ENGINES.map((e) => (
          <Link key={e.id} to={`/engines/${e.id}`} className="engine-card">
            <div className="engine-card-art" style={{ background: e.accent }}>
              <span>{e.name}</span>
            </div>
            <div className="engine-card-body">
              <h2>{e.name}</h2>
              <div className="engine-card-region">{e.region}</div>
              <p>{e.summary}</p>
              <span className="engine-card-cta">Fly →</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
