'use client';
import { useState } from 'react';

// Create/edit modal. `task` is null for create. Backend validates; errors are shown inline.
export default function TaskForm({ task, users, allTasks, me, onSave, onClose }) {
  const [f, setF] = useState(task || { title: '', description: '', priority: 'Medium', status: 'To Do', assigneeId: me.id, dependsOn: [] });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggleDep = (id) => setF({ ...f, dependsOn: f.dependsOn.includes(id) ? f.dependsOn.filter((d) => d !== id) : [...f.dependsOn, id] });

  async function submit(e) {
    e.preventDefault();
    try { await onSave(f); } catch (err) { setError(err.message); }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{task ? 'Edit task' : 'New task'}</h2>
        <label>Title<input required value={f.title} onChange={set('title')} /></label>
        <label>Description<textarea rows={3} value={f.description} onChange={set('description')} /></label>
        <label>Priority
          <select value={f.priority} onChange={set('priority')}>{['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label>Status
          <select value={f.status} onChange={set('status')}>{['To Do', 'In Progress', 'Done'].map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label>Assigned to
          <select value={f.assigneeId || ''} onChange={set('assigneeId')}>
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </label>
        <label>Depends on
          <div className="deps">
            {allTasks.filter((t) => t.id !== f.id).map((t) => (
              <label key={t.id}><input type="checkbox" checked={f.dependsOn.includes(t.id)} onChange={() => toggleDep(t.id)} />{t.title}</label>
            ))}
            {!allTasks.length && <span className="hint">No other tasks yet</span>}
          </div>
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="row">
          <button className="btn">Save task</button>
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
