import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { TopBar } from './components/TopBar';
import { SettingsPanel } from './components/SettingsPanel';
import { FullscreenProvider, useFullscreen } from './components/fullscreen';
import { SettingsProvider } from './settings/settings';
import { HomePage } from './pages/HomePage';
import { EnginePage } from './pages/EnginePage';

function Shell() {
  const { immersive } = useFullscreen();
  return (
    <div className={`app${immersive ? ' immersive' : ''}`}>
      {!immersive && <TopBar />}
      <div className="app-body">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/engines/:engineId" element={<EnginePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SettingsPanel />
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <FullscreenProvider>
          <Shell />
        </FullscreenProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
