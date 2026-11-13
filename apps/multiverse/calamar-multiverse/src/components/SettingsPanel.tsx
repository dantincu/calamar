import { useSettings, type Quality, type SpeedUnits } from '../settings/settings';
import { CloseIcon } from './Icons';

function formatHour(h: number): string {
  const hh = Math.floor(h) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function SettingsPanel() {
  const { settings: s, update, reset, panelOpen, setPanelOpen } = useSettings();
  if (!panelOpen) return null;

  return (
    <aside className="settings-panel" aria-label="Settings">
      <div className="settings-head">
        <h2>Settings</h2>
        <button className="icon-btn small" aria-label="Close settings" onClick={() => setPanelOpen(false)}>
          <CloseIcon />
        </button>
      </div>

      <section>
        <h3>World</h3>
        <label className="field">
          <span>Time of day <b>{formatHour(s.timeOfDay)}</b> · always the summer solstice (21 June)</span>
          <input type="range" min={0} max={24} step={0.25} value={s.timeOfDay} onChange={(e) => update({ timeOfDay: Number(e.target.value) })} />
        </label>
        <label className="check">
          <input type="checkbox" checked={s.traffic} onChange={(e) => update({ traffic: e.target.checked })} />
          Traffic and pedestrians
        </label>
        <label className="check">
          <input type="checkbox" checked={s.showLabels} onChange={(e) => update({ showLabels: e.target.checked })} />
          Building and street labels
        </label>
      </section>

      <section>
        <h3>Graphics</h3>
        <label className="field">
          <span>Quality</span>
          <select value={s.quality} onChange={(e) => update({ quality: e.target.value as Quality })}>
            <option value="low">Low (no shadows, lower resolution)</option>
            <option value="medium">Medium</option>
            <option value="high">High (full resolution, sharper shadows)</option>
          </select>
        </label>
        <label className="field">
          <span>Field of view <b>{s.fov}°</b></span>
          <input type="range" min={40} max={110} step={1} value={s.fov} onChange={(e) => update({ fov: Number(e.target.value) })} />
        </label>
      </section>

      <section>
        <h3>Controls</h3>
        <label className="field">
          <span>Mouse sensitivity <b>{s.mouseSensitivity.toFixed(2)}×</b></span>
          <input type="range" min={0.2} max={3} step={0.05} value={s.mouseSensitivity} onChange={(e) => update({ mouseSensitivity: Number(e.target.value) })} />
        </label>
        <label className="check">
          <input type="checkbox" checked={s.invertY} onChange={(e) => update({ invertY: e.target.checked })} />
          Invert vertical look
        </label>
      </section>

      <section>
        <h3>Display</h3>
        <label className="check">
          <input type="checkbox" checked={s.showHud} onChange={(e) => update({ showHud: e.target.checked })} />
          Show HUD (speed, altitude, compass)
        </label>
        <label className="field">
          <span>Units</span>
          <select value={s.speedUnits} onChange={(e) => update({ speedUnits: e.target.value as SpeedUnits })}>
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </label>
      </section>

      <button className="text-btn" onClick={reset}>Reset to defaults</button>
    </aside>
  );
}
