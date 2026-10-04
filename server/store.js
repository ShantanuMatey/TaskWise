// In-memory "database" + all business rules. Routes stay thin; logic lives here.
const { randomUUID } = require('crypto');

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['To Do', 'In Progress', 'Done'];

const users = new Map(); // id -> user
const tasks = new Map(); // id -> task

class HttpError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// ---------- helpers ----------
const publicUser = ({ password, ...u }) => u; // never leak passwords

// A task is blocked when it is not done and any dependency is not Done.
const pendingDeps = (t) => t.dependsOn.filter((id) => tasks.get(id)?.status !== 'Done');
const view = (t) => ({ ...t, blockedBy: pendingDeps(t), blocked: t.status !== 'Done' && pendingDeps(t).length > 0 });

// Does `from` (following dependsOn links) reach `target`? Used to stop circular dependencies.
function reaches(from, target, seen = new Set()) {
  if (from === target) return true;
  if (seen.has(from)) return false;
  seen.add(from);
  return (tasks.get(from)?.dependsOn || []).some((d) => reaches(d, target, seen));
}

// Validate + normalise task input (used by both create and update).
function validate(input, selfId) {
  const t = {
    title: String(input.title || '').trim(),
    description: String(input.description || '').trim(),
    priority: input.priority || 'Medium',
    status: input.status || 'To Do',
    assigneeId: input.assigneeId || null,
    dependsOn: [...new Set(input.dependsOn || [])],
  };
  if (!t.title) throw new HttpError(400, 'Title is required');
  if (!PRIORITIES.includes(t.priority)) throw new HttpError(400, 'Invalid priority');
  if (!STATUSES.includes(t.status)) throw new HttpError(400, 'Invalid status');
  if (t.assigneeId && !users.has(t.assigneeId)) throw new HttpError(400, 'Assignee does not exist');
  for (const d of t.dependsOn) {
    if (!tasks.has(d)) throw new HttpError(400, 'Dependency task does not exist');
    if (reaches(d, selfId)) throw new HttpError(400, 'Circular dependency detected');
  }
  // Rule: can only be Done when every dependency is Done.
  if (t.status === 'Done' && pendingDeps(t).length)
    throw new HttpError(409, 'Complete all dependencies before marking this task Done');
  return t;
}

// ---------- users ----------
function createUser({ name, email, password }) {
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  const mail = email.trim().toLowerCase();
  if ([...users.values()].some((u) => u.email === mail)) throw new HttpError(409, 'Email already registered');
  const user = { id: randomUUID(), name: name.trim(), email: mail, password };
  users.set(user.id, user);
  return publicUser(user);
}

function login({ email, password }) {
  const user = [...users.values()].find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!user || user.password !== password) throw new HttpError(401, 'Invalid email or password'); // mock auth
  return publicUser(user);
}

const listUsers = () => [...users.values()].map(publicUser);

// ---------- tasks ----------
function listTasks({ assignee, priority, status, blocked } = {}) {
  return [...tasks.values()]
    .map(view)
    .filter((t) => (!assignee || t.assigneeId === assignee) &&
      (!priority || t.priority === priority) &&
      (!status || t.status === status) &&
      (blocked === undefined || t.blocked === (blocked === 'true')));
}

function createTask(input) {
  const id = randomUUID();
  const task = { id, ...validate(input, id), createdAt: Date.now() };
  tasks.set(id, task);
  return view(task);
}

function updateTask(id, input) {
  const existing = tasks.get(id);
  if (!existing) throw new HttpError(404, 'Task not found');
  const updated = { ...existing, ...validate({ ...existing, ...input }, id) };
  tasks.set(id, updated);
  return view(updated);
}

function completeTask(id) {
  return updateTask(id, { status: 'Done' }); // validate() enforces the dependency rule
}

function deleteTask(id) {
  if (!tasks.delete(id)) throw new HttpError(404, 'Task not found');
  // Remove the deleted task from other tasks' dependency lists so nothing stays blocked forever.
  for (const t of tasks.values()) t.dependsOn = t.dependsOn.filter((d) => d !== id);
}

// ---------- demo data so the app looks alive on first load ----------
(function seed() {
  const a = createUser({ name: 'Aarav Sharma', email: 'aarav@demo.com', password: '1234' });
  const b = createUser({ name: 'Priya Deshmukh', email: 'priya@demo.com', password: '1234' });
  const design = createTask({ title: 'Design login screen', description: 'Wireframes and final UI', priority: 'High', status: 'Done', assigneeId: b.id });
  const api = createTask({ title: 'Build auth API', description: 'Signup and login endpoints', priority: 'High', status: 'In Progress', assigneeId: a.id, dependsOn: [design.id] });
  createTask({ title: 'Connect UI to API', description: 'Wire forms to backend', priority: 'Medium', assigneeId: a.id, dependsOn: [api.id] });
  createTask({ title: 'Write README', description: 'Setup and deploy notes', priority: 'Low', assigneeId: b.id });
})();

module.exports = { HttpError, listUsers, createUser, login, listTasks, createTask, updateTask, completeTask, deleteTask };
