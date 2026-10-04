'use client';
import { useState } from 'react';
import { api } from '../lib/api';

// Login / sign-up screen. Calls onAuth(user) on success.
export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      onAuth(mode === 'login' ? await api.login(f) : await api.signup(f));
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="auth">
      <section className="auth-hero">
        <h1>Taskwise</h1>
        <p>Assign work, set priorities, and see exactly what is blocking your team.</p>
        <div className="chain" aria-label="Example dependency chain">
          <span>Design UI</span><i>unlocks</i><span>Build API</span><i>unlocks</i><span>Connect UI</span>
        </div>
      </section>
      <section className="auth-form">
        <form className="card" onSubmit={submit}>
          <h2>{mode === 'login' ? 'Log in' : 'Create your account'}</h2>
          {mode === 'signup' && <label>Name<input required value={f.name} onChange={set('name')} /></label>}
          <label>Email<input required type="email" value={f.email} onChange={set('email')} /></label>
          <label>Password<input required type="password" value={f.password} onChange={set('password')} /></label>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn">{mode === 'login' ? 'Log in' : 'Create account'}</button>
          <p className="hint">
            {mode === 'login' ? 'New here? ' : 'Have an account? '}
            <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </p>
          <p className="hint">Demo login: aarav@demo.com / 1234</p>
        </form>
      </section>
    </div>
  );
}
