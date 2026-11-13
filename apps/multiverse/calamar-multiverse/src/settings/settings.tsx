import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Quality = 'low' | 'medium' | 'high';
export type SpeedUnits = 'metric' | 'imperial';

export interface Settings {
  /** Mouse look sensitivity multiplier (1 = default). */
  mouseSensitivity: number;
  invertY: boolean;
  /** Vertical field of view, degrees. */
  fov: number;
  quality: Quality;
  /** Hour of the day, 0–24, drives the sun, sky and lit windows. */
  timeOfDay: number;
  showHud: boolean;
  showLabels: boolean;
  traffic: boolean;
  speedUnits: SpeedUnits;
}

export const DEFAULT_SETTINGS: Settings = {
  mouseSensitivity: 1,
  invertY: false,
  fov: 70,
  quality: 'medium',
  timeOfDay: 15.5,
  showHud: true,
  showLabels: true,
  traffic: true,
  speedUnits: 'metric',
};

const STORAGE_KEY = 'calamar-multiverse.settings.v1';

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* storage unavailable or corrupt: use defaults */
  }
  return { ...DEFAULT_SETTINGS };
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const value = useMemo(
    () => ({ settings, update, reset, panelOpen, setPanelOpen }),
    [settings, update, reset, panelOpen],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
