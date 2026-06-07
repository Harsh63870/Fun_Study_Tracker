# Study Tracker

Command-based study tracker for college courses and extra learning. Full-stack app with React frontend and Express + SQLite backend.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18+, Tailwind CSS, GSAP, Axios, TanStack Query, React Router, Zustand |
| **Backend** | Node.js, Express, SQLite (better-sqlite3), Zod, JWT, Helmet, CORS, Morgan, Rate limiting |

## Quick Start

```bash
# Install all dependencies
npm install

# Run backend + frontend together
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

**Demo login:** `demo` / `demo123`

## Commands

| Command | Description |
|---------|-------------|
| `add 3h DSA` | Log study hours |
| `add task: solve 20 problems high` | Add task with priority |
| `done task name` | Complete a task |
| `delete session 5` | Remove session |
| `edit session 5 notes: learned BFS` | Edit session |
| `show stats` | Full statistics |
| `summary` | Today's summary |
| `weekly` | Weekly breakdown |
| `recommend` | Subject suggestion |
| `set goal DSA 40h` | Set subject goal |
| `export` / Import button | Backup & restore JSON |
| `reset` | Clear all data |
| `help` | All commands |

Hinglish: `add karo 2h dsa` bhi chalega!

## Project Structure

```
├── backend/          Express API + SQLite
│   └── src/
│       ├── routes/   REST endpoints
│       ├── services/ commands, stats, store
│       └── middleware/ auth (JWT), validation (Zod)
├── frontend/         React + Vite app
│   └── src/
│       ├── api/      Axios client
│       ├── components/
│       ├── hooks/    commands, GSAP animations
│       ├── pages/    Dashboard, Stats, Login
│       └── store/    Zustand (auth + UI state)
└── legacy/           Original vanilla JS version (index.html)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/register` | Create account |
| POST | `/api/commands` | Run text command |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/sessions` | Recent sessions |
| GET | `/api/tasks` | Tasks (filter by status) |
| GET | `/api/data/export` | Export JSON |
| POST | `/api/data/import` | Import JSON |

## Environment

Copy `backend/.env.example` to `backend/.env`:

```
PORT=5000
JWT_SECRET=change-me-in-production
CORS_ORIGIN=http://localhost:5173
```
