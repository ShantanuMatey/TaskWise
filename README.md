# Taskwise – Smart Task Manager (Full-stack assignment)

Next.js (React) frontend + Node.js/Express backend + in-memory database, served from ONE Node process.

## Run locally
```
npm install
npm run dev          # http://localhost:3000
```
Demo login: `aarav@demo.com` / `1234` (or sign up).

## Deploy (free, one URL) – Render.com
1. Push this folder to a GitHub repo.
2. Render → New → Web Service → connect repo.
3. Build command: `npm install && npm run build`   Start command: `npm start`
4. Deploy and share the URL. (Free tier sleeps when idle and in-memory data resets on restart – expected for this exercise.)

## Structure
- `server.js` – starts Express, mounts `/api`, hands other routes to Next.js
- `server/store.js` – in-memory Maps + all business rules (dependencies, cycle check, blocked logic)
- `server/routes.js` – REST endpoints
- `lib/api.js` – frontend API client
- `components/` – AuthScreen, TaskForm, TaskCard (reusable UI)
- `app/page.js` – main dashboard (tabs, filter, polling)

## API
| Method | Path | Purpose |
|---|---|---|
| GET/POST | /api/users | list / create user |
| POST | /api/login | mock login |
| GET | /api/tasks?assignee=&priority=&status=&blocked=true | list + filter |
| POST | /api/tasks | create |
| PUT | /api/tasks/:id | update |
| POST | /api/tasks/:id/complete | mark done (rejected if dependencies incomplete) |
| DELETE | /api/tasks/:id | delete |
