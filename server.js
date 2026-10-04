// Entry point: ONE Node process serves both the Express REST API (/api/*)
// and the Next.js frontend, so the whole app deploys as a single URL.
const express = require('express');
const next = require('next');

// Dev mode only with --dev; otherwise production (works on Windows too).
const dev = process.argv.includes('--dev');
if (!dev) process.env.NODE_ENV = 'production';
const port = process.env.PORT || 3000;
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();
  server.use(express.json());
  server.use('/api', require('./server/routes')); // backend
  server.all('*', (req, res) => handle(req, res)); // frontend (Next.js)
  server.listen(port, () => console.log(`Smart Task Manager running on http://localhost:${port}`));
});
