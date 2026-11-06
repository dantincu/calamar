import { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const palettes = {
  light: { background: '#ffffff', color: '#1d1d1f', accent: '#0a66c2' },
  dark: { background: '#1d1d1f', color: '#f5f5f7', accent: '#4ea1ff' },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  // Memoized so that consumers don't re-render when the provider's parent does.
  const value = useMemo(
    () => ({ theme, colors: palettes[theme], toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) }),
    [theme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

function ThemedButton({ children, onClick }) {
  const { colors } = useTheme();
  return (
    <button onClick={onClick} style={{ background: colors.accent, color: '#fff', border: 0, padding: '6px 12px', borderRadius: 6 }}>
      {children}
    </button>
  );
}

function Page() {
  const { theme, colors, toggle } = useTheme();
  return (
    <div style={{ ...colors, padding: 24, minHeight: 200, fontFamily: 'system-ui' }}>
      <h2>The {theme} theme</h2>
      <p>No props were passed to reach this component.</p>
      <ThemedButton onClick={toggle}>Toggle theme</ThemedButton>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}
