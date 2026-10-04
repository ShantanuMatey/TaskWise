// Tiny fetch wrapper: one place for all backend calls (reusability).
async function call(path, method = 'GET', body) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  users: () => call('/users'),
  signup: (u) => call('/users', 'POST', u),
  login: (c) => call('/login', 'POST', c),
  tasks: () => call('/tasks'),
  createTask: (t) => call('/tasks', 'POST', t),
  updateTask: (id, t) => call(`/tasks/${id}`, 'PUT', t),
  complete: (id) => call(`/tasks/${id}/complete`, 'POST'),
  remove: (id) => call(`/tasks/${id}`, 'DELETE'),
};
