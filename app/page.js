'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import AuthScreen from '../components/AuthScreen';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';

const STATUSES = ['To Do', 'In Progress', 'Done'];
const TITLES = { mine: 'My tasks', all: 'All tasks', blocked: 'Blocked tasks', team: 'Team' };

export default function Home() {
  const [me, setMe] = useState(null);        // logged-in user (mock auth)
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('dashboard'); // dashboard | mine | all | blocked | team
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined=closed, null=new, task=edit
  const [toast, setToast] = useState('');

  useEffect(() => { const s = localStorage.getItem('taskwise-user'); if (s) setMe(JSON.parse(s)); }, []);

  const refresh = useCallback(async () => {
    const [u, t] = await Promise.all([api.users(), api.tasks()]);
    setUsers(u); setTasks(t);
  }, []);

  // Load now, then poll every 4s so other users' changes appear without reloading.
  useEffect(() => {
    if (!me) return;
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [me, refresh]);

  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };
  // Run an action, refresh, and show backend rule errors (e.g. "complete dependencies first") as a toast.
  const act = (fn, msg) => async (...a) => { try { await fn(...a); await refresh(); msg && say(msg); } catch (e) { say(e.message); } };
  const login = (u) => { localStorage.setItem('taskwise-user', JSON.stringify(u)); setMe(u); };
  const logout = () => { localStorage.removeItem('taskwise-user'); setMe(null); setView('dashboard'); };

  if (!me) return <AuthScreen onAuth={login} />;

  const counts = {
    mine: tasks.filter((t) => t.assigneeId === me.id && t.status !== 'Done').length,
    all: tasks.length,
    blocked: tasks.filter((t) => t.blocked).length,
    team: users.length,
  };
  const visible = tasks
    .filter((t) => view === 'all' || (view === 'mine' && t.assigneeId === me.id) || (view === 'blocked' && t.blocked))
    .filter((t) => !priority || t.priority === priority)
    .filter((t) => !search || (t.title + t.description).toLowerCase().includes(search.toLowerCase()));

  const save = async (data) => {
    editing ? await api.updateTask(editing.id, data) : await api.createTask(data);
    setEditing(undefined); await refresh(); say('Task saved');
  };

  return (
    <>
      <Navbar me={me} view={view} setView={setView} counts={counts} onNew={() => setEditing(null)} onLogout={logout} />
      <main className="main">
        {view === 'dashboard' && <Dashboard me={me} tasks={tasks} users={users} onNew={() => setEditing(null)} goto={setView} />}

        {['mine', 'all', 'blocked'].includes(view) && (
          <>
            <div className="bar">
              <h2>{TITLES[view]}</h2>
              <div className="filters">
                <input type="search" placeholder="Search tasks" aria-label="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="">All priorities</option>
                  {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="cols">
              {STATUSES.map((s) => {
                const list = visible.filter((t) => t.status === s);
                return (
                  <section key={s} className="col">
                    <h3>{s}<span>{list.length}</span></h3>
                    {list.map((t) => (
                      <TaskCard key={t.id} task={t} users={users} allTasks={tasks}
                        onComplete={act((x) => api.complete(x.id), 'Task completed')}
                        onEdit={setEditing}
                        onDelete={act((x) => api.remove(x.id), 'Task deleted')} />
                    ))}
                    {!list.length && <div className="empty">{view === 'blocked' ? 'Nothing is blocked here.' : 'No tasks here yet.'}</div>}
                  </section>
                );
              })}
            </div>
          </>
        )}

        {view === 'team' && (
          <>
            <div className="bar"><h2>Team</h2></div>
            <div className="people">
              {users.map((u) => {
                const own = tasks.filter((t) => t.assigneeId === u.id);
                return (
                  <article className="panel person" key={u.id}>
                    <span className="avatar big">{u.name[0].toUpperCase()}</span>
                    <div><strong>{u.name}{u.id === me.id && ' (you)'}</strong><span className="hint">{u.email}</span></div>
                    <div className="meta"><span className="tag">{own.filter((t) => t.status !== 'Done').length} open</span><span className="tag Low">{own.filter((t) => t.status === 'Done').length} done</span></div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
      {editing !== undefined && <TaskForm task={editing} users={users} allTasks={tasks} me={me} onSave={save} onClose={() => setEditing(undefined)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
