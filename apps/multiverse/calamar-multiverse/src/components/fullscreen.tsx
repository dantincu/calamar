import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * "Immersive" mode hides the top bar and asks the browser for real full screen.
 * Escape always leaves it: the browser exits its own full screen on Escape (we follow via
 * `fullscreenchange`), and when full screen wasn't granted we listen for the key ourselves.
 */
interface FullscreenContextValue {
  immersive: boolean;
  enter: () => void;
  exit: () => void;
  toggle: () => void;
}

const FullscreenContext = createContext<FullscreenContextValue | null>(null);

export function FullscreenProvider({ children }: { children: ReactNode }) {
  const [immersive, setImmersive] = useState(false);

  const enter = useCallback(() => {
    setImmersive(true);
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        /* denied: stay in immersive mode without browser full screen */
      });
    }
  }, []);

  const exit = useCallback(() => {
    setImmersive(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const toggle = useCallback(() => (immersive ? exit() : enter()), [immersive, enter, exit]);

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImmersive(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const value = useMemo(() => ({ immersive, enter, exit, toggle }), [immersive, enter, exit, toggle]);
  return <FullscreenContext.Provider value={value}>{children}</FullscreenContext.Provider>;
}

export function useFullscreen(): FullscreenContextValue {
  const ctx = useContext(FullscreenContext);
  if (!ctx) throw new Error('useFullscreen must be used inside FullscreenProvider');
  return ctx;
}
