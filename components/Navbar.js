'use client';
import { useState } from 'react';

export const VIEWS = [['dashboard', 'Dashboard'], ['mine', 'My tasks'], ['all', 'All tasks'], ['blocked', 'Blocked'], ['team', 'Team']];

// Sticky top navbar: brand, page links with live counts, new-task button, account menu.
export default function Navbar({ me, view, setView, counts, onNew, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <button className="logo" onClick={() => setView('dashboard')}><b className="mark">T</b>Taskwise</button>
      <nav className="links" aria-label="Main">
        {VIEWS.map(([k, label]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>
            {label}{counts[k] != null && <em>{counts[k]}</em>}
          </button>
        ))}
      </nav>
      <div className="nav-r">
        <button className="btn" onClick={onNew}>New task</button>
        <div className="menu">
          <button className="avatar" onClick={() => setOpen(!open)} aria-label="Account menu">{me.name[0].toUpperCase()}</button>
          {open && (
            <div className="drop">
              <strong>{me.name}</strong><span className="hint">{me.email}</span>
              <button className="btn ghost" onClick={onLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
