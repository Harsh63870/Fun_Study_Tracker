import {
  getAverageHoursPerDay,
  getMostStudiedSubject,
  getProgressPercentage,
  getRecommendation,
  getStudyStreak,
  getSubjectHours,
  getTaskCompletionRate,
  getTodaySummary,
  getTotalHours,
  getWeeklyHours,
} from "./stats.js";

function normalizeSubject(name) {
  const aliases = {
    dsa: "DSA",
    dbms: "DBMS",
    "web dev": "Web Dev",
    webdev: "Web Dev",
    "web development": "Web Dev",
    "ai/ml": "AI/ML",
    aiml: "AI/ML",
    cloud: "Cloud",
    "system design": "System Design",
    sd: "System Design",
    cp: "Competitive Programming",
    leetcode: "LeetCode",
    projects: "Projects",
    cncf: "Projects",
    candee: "Projects",
  };
  const lower = name.trim().toLowerCase();
  if (aliases[lower]) return aliases[lower];
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function ensureSubject(store, subject) {
  const normalized = normalizeSubject(subject);
  if (!store.subjects.includes(normalized)) {
    store.subjects.push(normalized);
  }
  return normalized;
}

function findTask(store, name) {
  const lower = name.toLowerCase();
  return store.tasks.find(
    (t) =>
      t.title.toLowerCase() === lower ||
      t.title.toLowerCase().includes(lower)
  );
}

function findSession(store, id) {
  return store.sessions.find((s) => s.id === Number(id));
}

function formatStats(store) {
  const total = getTotalHours(store);
  const avg = getAverageHoursPerDay(store);
  const top = getMostStudiedSubject(store);
  const tasks = getTaskCompletionRate(store);
  const streak = getStudyStreak(store);
  const progress = getProgressPercentage(store);
  const subjects = getSubjectHours(store);

  let out = `📊 Statistics\n`;
  out += `Total hours: ${total.toFixed(1)}h\n`;
  out += `Avg per day: ${avg.toFixed(1)}h\n`;
  out += `Streak: ${streak} day(s) 🔥\n`;
  out += `Progress: ${progress}%\n`;
  out += `Tasks done: ${tasks.completed}/${tasks.total} (${tasks.rate}%)\n`;
  if (top) out += `Most studied: ${top.subject} (${top.hours.toFixed(1)}h)\n`;
  out += `\nSubject breakdown:\n`;
  const sorted = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
  for (const [sub, h] of sorted) {
    out += `  • ${sub}: ${h.toFixed(1)}h\n`;
  }
  return out.trim();
}

function formatSummary(store) {
  const { todaySessions, todayHours, completedToday } = getTodaySummary(store);
  const pending = store.tasks.filter((t) => t.status === "pending");

  let out = `📅 Aaj ka Summary (${new Date().toLocaleDateString("en-IN")})\n`;
  out += `Study: ${todayHours.toFixed(1)}h across ${todaySessions.length} session(s)\n`;

  if (todaySessions.length) {
    for (const s of todaySessions) {
      out += `  #${s.id} ${s.subject} — ${s.hours}h`;
      if (s.notes) out += ` (${s.notes})`;
      out += `\n`;
    }
  } else {
    out += `  Abhi koi session nahi — "add 2h DSA" try karo!\n`;
  }

  out += `Tasks completed today: ${completedToday.length}\n`;
  out += `Pending tasks: ${pending.length}\n`;
  if (pending.length) {
    for (const t of pending.slice(0, 5)) {
      out += `  • [${t.priority}] ${t.title}\n`;
    }
  }
  return out.trim();
}

function formatWeekly(store) {
  const week = getWeeklyHours(store);
  const total = week.reduce((s, d) => s + d.hours, 0);
  let out = `📆 Weekly Summary\nTotal: ${total.toFixed(1)}h\n\n`;
  for (const d of week) {
    const bar = "█".repeat(Math.round(d.hours)) || "·";
    out += `${d.label}: ${d.hours.toFixed(1)}h ${bar}\n`;
  }
  const subjects = {};
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  for (const s of store.sessions) {
    if (s.archived) continue;
    if (new Date(s.date) >= weekStart) {
      subjects[s.subject] = (subjects[s.subject] || 0) + s.hours;
    }
  }
  if (Object.keys(subjects).length) {
    out += `\nBy subject:\n`;
    for (const [sub, h] of Object.entries(subjects).sort((a, b) => b[1] - a[1])) {
      out += `  • ${sub}: ${h.toFixed(1)}h\n`;
    }
  }
  return out.trim();
}

const HELP_TEXT = `Available commands:

Study sessions:
  add 3h DSA          — log study hours
  log 2.5 hours web dev
  edit session 5 hours 4
  edit session 5 notes: learned BFS
  delete session 5
  archive session 5

Tasks:
  add task: solve 20 problems
  add task: CNCF PR high deadline 2025-06-15
  done solve 20 problems
  delete task: task name
  list pending

Stats & info:
  show stats / stats
  summary / aaj ka summary
  weekly / weekly summary
  recommend

Subjects & goals:
  add subject: Rust
  set goal DSA 40h

Data:
  export
  reset (clears all data)

Tips: Hinglish works — "add karo 2h dsa" bhi chalega!`;

export function parseCommand(raw, store) {
  const input = raw.trim();
  if (!input) return { type: "empty" };

  const lower = input.toLowerCase();

  if (/^(help|\?|commands)$/.test(lower)) {
    return { type: "message", text: HELP_TEXT, level: "info" };
  }

  if (/^(show stats|stats|statistics)$/.test(lower)) {
    return { type: "message", text: formatStats(store), level: "info" };
  }

  if (/^(summary|aaj ka summary|today)$/.test(lower)) {
    return { type: "message", text: formatSummary(store), level: "info" };
  }

  if (/^(weekly|weekly summary)$/.test(lower)) {
    return { type: "message", text: formatWeekly(store), level: "info" };
  }

  if (/^(recommend|suggestion)$/.test(lower)) {
    const rec = getRecommendation(store);
    return {
      type: "message",
      text: `💡 Aaj ${rec.subject} padho — ~${rec.due}h due (${rec.reason})`,
      level: "info",
    };
  }

  if (/^(list pending|pending|tasks)$/.test(lower)) {
    const pending = store.tasks.filter((t) => t.status === "pending");
    if (!pending.length) {
      return { type: "message", text: "Koi pending task nahi! 🎉", level: "success" };
    }
    let text = `Pending tasks (${pending.length}):\n`;
    for (const t of pending) {
      text += `  #${t.id} [${t.priority}] ${t.title}`;
      if (t.deadline) text += ` — due ${t.deadline}`;
      text += `\n`;
    }
    return { type: "message", text: text.trim(), level: "info" };
  }

  if (/^reset$/.test(lower)) {
    return { type: "reset" };
  }

  if (/^export$/.test(lower)) {
    return { type: "export" };
  }

  const addSubject = input.match(/^add subject:\s*(.+)$/i);
  if (addSubject) {
    const subject = ensureSubject(store, addSubject[1]);
    return {
      type: "mutate",
      message: `Subject "${subject}" add ho gaya.`,
      level: "success",
    };
  }

  const setGoal = input.match(/^set goal\s+(.+?)\s+(\d+(?:\.\d+)?)\s*h?$/i);
  if (setGoal) {
    const subject = ensureSubject(store, setGoal[1]);
    store.subjectGoals[subject] = parseFloat(setGoal[2]);
    return {
      type: "mutate",
      message: `Goal set: ${subject} → ${setGoal[2]}h`,
      level: "success",
    };
  }

  const addSession =
    input.match(/^(?:add|log)(?:\s+karo)?\s+(\d+(?:\.\d+)?)\s*h(?:ours?|r)?\s+(.+)$/i) ||
    input.match(/^(?:add|log)\s+(\d+(?:\.\d+)?)\s+hours?\s+(.+)$/i);

  if (addSession) {
    const hours = parseFloat(addSession[1]);
    const subject = ensureSubject(store, addSession[2].replace(/\s+notes?:.*$/i, ""));
    const now = new Date();
    const session = {
      id: store.nextSessionId++,
      subject,
      hours,
      date: now.toISOString(),
      time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      type: "study session",
      status: "completed",
      notes: "",
      archived: false,
    };
    const notesMatch = addSession[2].match(/notes?:\s*(.+)$/i);
    if (notesMatch) session.notes = notesMatch[1].trim();

    store.sessions.unshift(session);
    return {
      type: "mutate",
      message: `✓ ${hours}h ${subject} logged (session #${session.id})`,
      level: "success",
    };
  }

  const addTask = input.match(/^add task:\s*(.+)$/i);
  if (addTask) {
    let rest = addTask[1].trim();
    let priority = "medium";
    let deadline = null;

    const priorityMatch = rest.match(/\b(high|medium|low)\b/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase();
      rest = rest.replace(/\b(high|medium|low)\b/i, "").trim();
    }

    const deadlineMatch = rest.match(/deadline\s+(\d{4}-\d{2}-\d{2})/i);
    if (deadlineMatch) {
      deadline = deadlineMatch[1];
      rest = rest.replace(/deadline\s+\d{4}-\d{2}-\d{2}/i, "").trim();
    }

    const task = {
      id: store.nextTaskId++,
      title: rest,
      priority,
      deadline,
      type: "task",
      status: "pending",
      notes: "",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    store.tasks.unshift(task);
    return {
      type: "mutate",
      message: `✓ Task added: "${rest}" [${priority}]`,
      level: "success",
    };
  }

  const doneTask = input.match(/^done\s+(.+)$/i);
  if (doneTask) {
    const task = findTask(store, doneTask[1]);
    if (!task) {
      return { type: "message", text: `Task "${doneTask[1]}" nahi mila.`, level: "error" };
    }
    task.status = "completed";
    task.completedAt = new Date().toISOString();
    return {
      type: "mutate",
      message: `✓ Done: "${task.title}"`,
      level: "success",
    };
  }

  const deleteTask = input.match(/^delete task:\s*(.+)$/i);
  if (deleteTask) {
    const task = findTask(store, deleteTask[1]);
    if (!task) {
      return { type: "message", text: `Task "${deleteTask[1]}" nahi mila.`, level: "error" };
    }
    store.tasks = store.tasks.filter((t) => t.id !== task.id);
    return {
      type: "mutate",
      message: `Task "${task.title}" delete ho gaya.`,
      level: "success",
    };
  }

  const deleteSession = input.match(/^delete session\s+(\d+)$/i);
  if (deleteSession) {
    const session = findSession(store, deleteSession[1]);
    if (!session) {
      return { type: "message", text: `Session #${deleteSession[1]} nahi mila.`, level: "error" };
    }
    store.sessions = store.sessions.filter((s) => s.id !== session.id);
    return {
      type: "mutate",
      message: `Session #${session.id} (${session.subject}, ${session.hours}h) delete ho gaya.`,
      level: "success",
    };
  }

  const archiveSession = input.match(/^archive session\s+(\d+)$/i);
  if (archiveSession) {
    const session = findSession(store, archiveSession[1]);
    if (!session) {
      return { type: "message", text: `Session #${archiveSession[1]} nahi mila.`, level: "error" };
    }
    session.archived = true;
    return {
      type: "mutate",
      message: `Session #${session.id} archived.`,
      level: "success",
    };
  }

  const editSession = input.match(/^edit session\s+(\d+)\s+(.+)$/i);
  if (editSession) {
    const session = findSession(store, editSession[1]);
    if (!session) {
      return { type: "message", text: `Session #${editSession[1]} nahi mila.`, level: "error" };
    }
    const rest = editSession[2];
    const hoursMatch = rest.match(/^hours?\s+(\d+(?:\.\d+)?)/i);
    const subjectMatch = rest.match(/^subject\s+(.+?)(?:\s+notes?:|$)/i);
    const notesMatch = rest.match(/notes?:\s*(.+)$/i);

    if (hoursMatch) session.hours = parseFloat(hoursMatch[1]);
    if (subjectMatch) session.subject = ensureSubject(store, subjectMatch[1]);
    if (notesMatch) session.notes = notesMatch[1].trim();

    return {
      type: "mutate",
      message: `Session #${session.id} updated.`,
      level: "success",
    };
  }

  return {
    type: "message",
    text: `Samajh nahi aaya: "${input}"\nType "help" for commands.`,
    level: "error",
  };
}
