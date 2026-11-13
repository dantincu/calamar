import type { EngineModule } from './core/types';

export interface EngineInfo {
  id: string;
  name: string;
  region: string;
  summary: string;
  /** CSS gradient for the engine's card. */
  accent: string;
  load: () => Promise<EngineModule>;
}

export const ENGINES: EngineInfo[] = [
  {
    id: 'bucharest-ilfov',
    name: 'Bucharest & Ilfov',
    region: 'Magheru Boulevard, from Piața Romană to Bălcescu',
    summary:
      'The interwar modernist boulevard: Patria (ARO), Scala, Lido, Ambasador, Nottara, Ciclop and their neighbours, with traffic, trolleybus wires and the surrounding city blocks.',
    accent: 'linear-gradient(135deg, #1d3557 0%, #457b9d 55%, #f1c453 100%)',
    load: () => import('./bucharest-ilfov'),
  },
];

export function findEngine(id: string | undefined): EngineInfo | undefined {
  return ENGINES.find((e) => e.id === id);
}
