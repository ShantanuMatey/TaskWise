// Express REST API. Each route just calls the store and returns JSON.
const router = require('express').Router();
const db = require('./store');

// Wrap handlers so thrown HttpErrors become clean JSON responses.
const wrap = (fn) => (req, res) => {
  try { res.json(fn(req) ?? { ok: true }); }
  catch (e) { res.status(e.code || 500).json({ error: e.message }); }
};

// Users
router.get('/users', wrap(() => db.listUsers()));
router.post('/users', wrap((r) => db.createUser(r.body)));
router.post('/login', wrap((r) => db.login(r.body)));

// Tasks  (GET supports ?assignee=&priority=&status=&blocked=true)
router.get('/tasks', wrap((r) => db.listTasks(r.query)));
router.post('/tasks', wrap((r) => db.createTask(r.body)));
router.put('/tasks/:id', wrap((r) => db.updateTask(r.params.id, r.body)));
router.post('/tasks/:id/complete', wrap((r) => db.completeTask(r.params.id)));
router.delete('/tasks/:id', wrap((r) => db.deleteTask(r.params.id)));

module.exports = router;
