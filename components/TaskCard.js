// Presentational card for one task. All actions are passed in as props (reusable).
export default function TaskCard({ task, users, allTasks, onComplete, onEdit, onDelete }) {
  const name = (id) => users.find((u) => u.id === id)?.name || 'Unassigned';
  const waitingOn = task.blockedBy.map((id) => allTasks.find((t) => t.id === id)?.title).filter(Boolean);

  return (
    <article className={`task ${task.priority} ${task.blocked ? 'is-blocked' : ''}`}>
      <h4>{task.title}</h4>
      {task.description && <p>{task.description}</p>}
      <div className="meta">
        <span className={`tag ${task.priority}`}>{task.priority}</span>
        <span className="tag">{name(task.assigneeId)}</span>
        {task.blocked && <span className="tag blocked">Blocked</span>}
      </div>
      {task.blocked && <p className="hint">Waiting on: {waitingOn.join(', ')}</p>}
      <div className="row">
        {task.status !== 'Done' && (
          <button className="btn" disabled={task.blocked} onClick={() => onComplete(task)}
            title={task.blocked ? 'Finish its dependencies first' : ''}>Mark done</button>
        )}
        <button className="btn ghost" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn danger" onClick={() => onDelete(task)}>Delete</button>
      </div>
    </article>
  );
}
