import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ENGINES } from '../engines/registry';
import { useSettings } from '../settings/settings';
import { EnginesIcon, HomeIcon, SettingsIcon } from './Icons';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { panelOpen, setPanelOpen } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  const current = ENGINES.find((e) => location.pathname === `/engines/${e.id}`);

  return (
    <header className="topbar">
      <button className="icon-btn" title="Home" aria-label="Home" onClick={() => navigate('/')}>
        <HomeIcon />
      </button>

      <div className="menu-anchor" ref={menuRef}>
        <button
          className={`icon-btn${menuOpen ? ' active' : ''}`}
          title="Choose a graphical engine"
          aria-label="Choose a graphical engine"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <EnginesIcon />
        </button>
        {menuOpen && (
          <div className="menu" role="menu">
            <div className="menu-header">Multiverse engines</div>
            {ENGINES.map((e) => (
              <Link key={e.id} role="menuitem" className={`menu-item${current?.id === e.id ? ' current' : ''}`} to={`/engines/${e.id}`}>
                <span className="menu-swatch" style={{ background: e.accent }} />
                <span>
                  <span className="menu-item-name">{e.name}</span>
                  <span className="menu-item-sub">{e.region}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-title">
        <Link to="/" className="brand">Calamar Multiverse</Link>
        {current && <span className="topbar-crumb">/ {current.name}</span>}
      </div>

      <button
        className={`icon-btn${panelOpen ? ' active' : ''}`}
        title="Settings"
        aria-label="Settings"
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <SettingsIcon />
      </button>
    </header>
  );
}
