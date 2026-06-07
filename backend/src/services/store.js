import db, { ensureUserSubjects } from "../db.js";

function mapSession(row) {
  return {
    id: row.id,
    subject: row.subject,
    hours: row.hours,
    date: row.date,
    time: row.time,
    notes: row.notes || "",
    type: "study session",
    status: "completed",
    archived: Boolean(row.archived),
  };
}

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    deadline: row.deadline,
    type: "task",
    status: row.status,
    notes: row.notes || "",
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export function loadStore(userId) {
  ensureUserSubjects(userId);

  const sessions = db
    .prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY id DESC")
    .all(userId)
    .map(mapSession);

  const tasks = db
    .prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC")
    .all(userId)
    .map(mapTask);

  const subjectRows = db
    .prepare("SELECT name, goal_hours FROM subjects WHERE user_id = ? ORDER BY name")
    .all(userId);

  const maxSession = db.prepare("SELECT MAX(id) as m FROM sessions WHERE user_id = ?").get(userId);
  const maxTask = db.prepare("SELECT MAX(id) as m FROM tasks WHERE user_id = ?").get(userId);

  return {
    sessions,
    tasks,
    subjects: subjectRows.map((s) => s.name),
    subjectGoals: Object.fromEntries(
      subjectRows.filter((s) => s.goal_hours > 0).map((s) => [s.name, s.goal_hours])
    ),
    nextSessionId: (maxSession?.m || 0) + 1,
    nextTaskId: (maxTask?.m || 0) + 1,
  };
}

export function persistStore(userId, store) {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM tasks WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM subjects WHERE user_id = ?").run(userId);

    const insertSubject = db.prepare(
      "INSERT INTO subjects (user_id, name, goal_hours) VALUES (?, ?, ?)"
    );
    for (const name of store.subjects) {
      insertSubject.run(userId, name, store.subjectGoals[name] || 0);
    }

    const insertSession = db.prepare(
      "INSERT INTO sessions (id, user_id, subject, hours, date, time, notes, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const s of store.sessions) {
      insertSession.run(
        s.id,
        userId,
        s.subject,
        s.hours,
        s.date,
        s.time,
        s.notes || "",
        s.archived ? 1 : 0
      );
    }

    const insertTask = db.prepare(
      "INSERT INTO tasks (id, user_id, title, priority, deadline, status, notes, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const t of store.tasks) {
      insertTask.run(
        t.id,
        userId,
        t.title,
        t.priority,
        t.deadline,
        t.status,
        t.notes || "",
        t.createdAt,
        t.completedAt
      );
    }
  });

  tx();
}

export function resetUserData(userId) {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM tasks WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM subjects WHERE user_id = ?").run(userId);
    ensureUserSubjects(userId);
  });
  tx();
}
