# Fun Study Tracker

A command-driven, full-stack study tracker built for college students and self-learners. Log study sessions, manage tasks, track progress, and get smart subject recommendations — all via a fast, Hinglish-friendly command interface.

> **Demo credentials:** `demo` / `demo123`

---

## Features

- **Command-based interface** — type natural commands to log sessions, add tasks, view stats
- **Hinglish support** — `add karo 2h dsa` works just as well as `add 2h DSA`
- **Per-user data** — JWT-authenticated accounts with isolated SQLite storage
- **Rich analytics** — streaks, weekly charts, burndown graphs, goal progress, subject breakdown
- **AI-style recommendations** — suggests which subject to study next based on your goals and history
- **Export / Import** — backup and restore your data as JSON
- **Legacy version included** — original pure vanilla JS/HTML app in `/legacy`

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, GSAP 3, TanStack Query v5, React Router v7, Zustand v5, Axios |
| **Backend** | Node.js (ESM), Express 5, SQLite via `better-sqlite3`, Zod, JWT (`jsonwebtoken`), bcryptjs, Helmet, Morgan, express-rate-limit |
| **Tooling** | npm Workspaces, concurrently, Vite dev proxy |

---

## Quick Start

### Prerequisites

- Node.js v18+ (v20+ recommended)
- npm v9+

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/fun-study-tracker.git
cd fun-study-tracker

# 2. Install all dependencies (workspaces: backend + frontend)
npm install

# 3. Set up backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — set a strong JWT_SECRET for production!

# 4. Run backend + frontend together
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
JWT_SECRET=change-me-in-production   # ← use a long random string in prod
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

> The `JWT_SECRET` fallback in code is for development only. **Always set a proper secret in production.**

---

## Command Reference

All commands are typed into the command bar on the Dashboard.

### Study Sessions

| Command | Description |
|---|---|
| `add 3h DSA` | Log 3 hours of DSA study |
| `add 2.5h Web Dev notes: learned Redux` | Log with a note |
| `log 2 hours Cloud` | Alternative syntax |
| `add karo 2h dsa` | Hinglish — works too! |
| `edit session 5 hours 4` | Update session hours |
| `edit session 5 notes: understood BFS` | Update session notes |
| `delete session 5` | Remove a session |
| `archive session 5` | Archive without deleting |

### Tasks

| Command | Description |
|---|---|
| `add task: solve 20 problems` | Add a task (default priority: medium) |
| `add task: CNCF PR high deadline 2025-06-15` | Add task with priority + deadline |
| `done solve 20 problems` | Mark task complete |
| `delete task: task name` | Delete a task |
| `list pending` | Show all pending tasks |

### Stats & Info

| Command | Description |
|---|---|
| `show stats` / `stats` | Full statistics overview |
| `summary` / `aaj ka summary` | Today's summary |
| `weekly` / `weekly summary` | Last 7 days breakdown |
| `recommend` | Suggests what to study next |

### Subjects & Goals

| Command | Description |
|---|---|
| `add subject: Rust` | Add a new subject |
| `set goal DSA 40h` | Set a total-hours goal for a subject |

### Data

| Command | Description |
|---|---|
| `export` | Download all data as JSON |
| `reset` | ⚠️ Clear all your data |
| `help` | Show all commands |

---

## Project Structure

```
fun-study-tracker/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js              # Express app entry, middleware setup
│       ├── config.js             # Env config
│       ├── db.js                 # SQLite init, schema, seed
│       ├── middleware/
│       │   ├── auth.js           # JWT verify + sign
│       │   ├── errorHandler.js   # Global error handler
│       │   └── validate.js       # Zod request validation
│       ├── routes/
│       │   ├── auth.js           # POST /register, POST /login
│       │   ├── commands.js       # POST /commands
│       │   ├── sessions.js       # GET /sessions
│       │   ├── tasks.js          # GET /tasks
│       │   ├── stats.js          # GET /stats
│       │   └── data.js           # GET /data/export, POST /data/import
│       ├── services/
│       │   ├── commands.js       # Command parser & executor (core logic)
│       │   ├── stats.js          # All statistics calculations
│       │   └── store.js          # SQLite read/write helpers
│       └── utils/
│           └── subjects.js       # Default subjects + normalization
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js            # Vite + Tailwind + /api proxy
│   ├── package.json
│   └── src/
│       ├── main.jsx              # React root
│       ├── App.jsx               # Router + ProtectedRoute
│       ├── index.css             # Tailwind + CSS variables (dark theme)
│       ├── api/
│       │   ├── client.js         # Axios instance + JWT interceptors
│       │   ├── auth.js           # login/register calls
│       │   └── tracker.js        # commands, stats, sessions, tasks, export
│       ├── components/
│       │   ├── CommandInput.jsx  # Command bar + hint chips
│       │   ├── StatsGrid.jsx     # 5-card summary row
│       │   ├── Charts.jsx        # Canvas bar + line charts
│       │   ├── SubjectChart.jsx  # Subject hour breakdown
│       │   ├── SessionsList.jsx  # Recent sessions list
│       │   ├── TasksList.jsx     # Pending tasks list
│       │   ├── DataActions.jsx   # Export/import buttons
│       │   └── Layout.jsx        # Nav + Outlet wrapper
│       ├── hooks/
│       │   ├── useCommands.js    # TanStack useMutation for commands
│       │   └── useGsapEntrance.js # GSAP fade-in animation hook
│       ├── lib/
│       │   └── queryClient.js    # TanStack QueryClient + invalidateAll
│       ├── pages/
│       │   ├── Login.jsx         # Login / Register form
│       │   ├── Dashboard.jsx     # Main dashboard
│       │   └── StatsPage.jsx     # Full stats view
│       └── store/
│           ├── useAuthStore.js   # Zustand auth (token + user, persisted)
│           └── useAppStore.js    # Zustand UI (command output)
│
├── legacy/                       # Original vanilla JS version
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── app.js
│       ├── commands.js
│       ├── stats.js
│       ├── storage.js
│       └── ui.js
│
├── package.json                  # Root workspace config + scripts
└── package-lock.json
```

---

## API Reference

All endpoints except `/api/auth/*` and `/api/health` require a `Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account → returns JWT |
| POST | `/api/auth/login` | No | Login → returns JWT |
| POST | `/api/commands` | Yes | Execute a text command |
| GET | `/api/stats` | Yes | Full stats payload |
| GET | `/api/sessions` | Yes | All sessions |
| GET | `/api/tasks?status=pending` | Yes | Tasks (filterable) |
| GET | `/api/data/export` | Yes | Full JSON backup |
| POST | `/api/data/import` | Yes | Restore from JSON |

---

## Database Schema

SQLite database is auto-created at `backend/data/study.db` on first run.

```sql
users     (id, username, password_hash, created_at)
subjects  (id, user_id, name, goal_hours)
sessions  (id, user_id, subject, hours, date, time, notes, archived)
tasks     (id, user_id, title, priority, deadline, status, notes, created_at, completed_at)
```

- Foreign keys cascade on user delete
- WAL mode enabled for better concurrent read performance

---

## @hvp :)