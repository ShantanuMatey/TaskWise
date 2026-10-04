const RANK = { High: 0, Medium: 1, Low: 2 };

// Overview page: personal stats, team progress, priority mix, workload and what to do next.
export default function Dashboard({ me, tasks, users, onNew, goto }) {
  const mine = tasks.filter((t) => t.assigneeId === me.id);
  const open = tasks.filter((t) => t.status !== 'Done');
  const done = tasks.length - open.length;
  const pct = tasks.length ? Math.round((100 * done) / tasks.length) : 0;
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    ['Assigned to me', mine.length, 'c1', 'mine'],
    ['In progress', mine.filter((t) => t.status === 'In Progress').length, 'c2', 'mine'],
    ['Completed', mine.filter((t) => t.status === 'Done').length, 'c3', 'mine'],
    ['Blocked', mine.filter((t) => t.blocked).length, 'c4', 'blocked'],
  ];
  const next = mine.filter((t) => t.status !== 'Done' && !t.blocked).sort((a, b) => RANK[a.priority] - RANK[b.priority]).slice(0, 5);
  const byPriority = ['High', 'Medium', 'Low'].map((p) => [p, open.filter((t) => t.priority === p).length]);
  const maxP = Math.max(1, ...byPriority.map((x) => x[1]));
  const load = users.map((u) => [u.name, open.filter((t) => t.assigneeId === u.id).length]);
  const maxL = Math.max(1, ...load.map((x) => x[1]));

  return (
    <>
      <section className="hero">
        <div>
          <h1>{hello}, {me.name.split(' ')[0]}</h1>
          <p>{open.length ? `${open.length} open task${open.length > 1 ? 's' : ''} across the team, ${tasks.filter((t) => t.blocked).length} blocked.` : 'Nothing open. Create a task to get started.'}</p>
        </div>
        <div className="ring" style={{ '--p': pct }}><span>{pct}%</span><small>team progress</small></div>
      </section>

      <section className="stats">
        {stats.map(([label, n, c, to]) => (
          <button key={label} className={`stat ${c}`} onClick={() => goto(to)}><strong>{n}</strong><span>{label}</span></button>
        ))}
      </section>

      <div className="grid2">
        <section className="panel">
          <h3>Up next for you</h3>
          {next.map((t) => (
            <div className="line" key={t.id}><span>{t.title}</span><span className={`tag ${t.priority}`}>{t.priority}</span></div>
          ))}
          {!next.length && (
            <div className="empty">No ready tasks for you. <button className="link" onClick={onNew}>Create a task</button></div>
          )}
        </section>

        <section className="panel">
          <h3>Open tasks by priority</h3>
          {byPriority.map(([p, n]) => (
            <div className="bar-row" key={p}><span>{p}</span><div className="track"><i className={p} style={{ width: `${(100 * n) / maxP}%` }} /></div><b>{n}</b></div>
          ))}
        </section>

        <section className="panel">
          <h3>Team workload</h3>
          {load.map(([name, n]) => (
            <div className="bar-row" key={name}><span>{name}</span><div className="track"><i className="brand" style={{ width: `${(100 * n) / maxL}%` }} /></div><b>{n}</b></div>
          ))}
        </section>

        <section className="panel">
          <h3>Blocked tasks</h3>
          {tasks.filter((t) => t.blocked).slice(0, 4).map((t) => {
            const wait = t.blockedBy.map((id) => tasks.find((x) => x.id === id)?.title).filter(Boolean);
            return <div className="line" key={t.id}><span>{t.title}<small>Waiting on {wait.join(', ')}</small></span><span className="tag blocked">Blocked</span></div>;
          })}
          {!tasks.some((t) => t.blocked) && <div className="empty">Nothing is blocked.</div>}
        </section>
      </div>
    </>
  );
}
