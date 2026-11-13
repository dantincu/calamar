import { Link, useParams } from 'react-router';
import { findEngine } from '../engines/registry';
import { EngineViewport } from '../engines/core/EngineViewport';

export function EnginePage() {
  const { engineId } = useParams();
  const engine = findEngine(engineId);
  if (!engine) {
    return (
      <main className="home">
        <h1>Unknown engine</h1>
        <p>
          There is no engine called “{engineId}”. <Link to="/">Back home</Link>
        </p>
      </main>
    );
  }
  // key: a fresh viewport (renderer, world, drone) per engine
  return <EngineViewport key={engine.id} engine={engine} />;
}
