function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function isSameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

export function getSubjectHours(store, includeArchived = false) {
  const map = {};
  for (const s of store.sessions) {
    if (!includeArchived && s.archived) continue;
    const key = s.subject;
    map[key] = (map[key] || 0) + s.hours;
  }
  return map;
}

export function getTotalHours(store) {
  return Object.values(getSubjectHours(store)).reduce((a, b) => a + b, 0);
}

export function getTodayHours(store) {
  const today = new Date();
  return store.sessions
    .filter((s) => !s.archived && isSameDay(s.date, today))
    .reduce((sum, s) => sum + s.hours, 0);
}

export function getAverageHoursPerDay(store) {
  const days = new Set(
    store.sessions.filter((s) => !s.archived).map((s) => dateKey(s.date))
  );
  if (days.size === 0) return 0;
  return getTotalHours(store) / days.size;
}

export function getMostStudiedSubject(store) {
  const hours = getSubjectHours(store);
  let best = null;
  let max = 0;
  for (const [subject, h] of Object.entries(hours)) {
    if (h > max) {
      max = h;
      best = subject;
    }
  }
  return best ? { subject: best, hours: max } : null;
}

export function getTaskCompletionRate(store) {
  const total = store.tasks.length;
  if (total === 0) return { rate: 0, completed: 0, total: 0 };
  const completed = store.tasks.filter((t) => t.status === "completed").length;
  return { rate: Math.round((completed / total) * 100), completed, total };
}

export function getStudyStreak(store) {
  const daySet = new Set(
    store.sessions.filter((s) => !s.archived).map((s) => dateKey(s.date))
  );
  if (daySet.size === 0) return 0;

  let streak = 0;
  const cursor = startOfDay(new Date());

  while (daySet.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getWeeklyHours(store) {
  const result = [];
  const today = startOfDay(new Date());

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const hours = store.sessions
      .filter((s) => !s.archived && dateKey(s.date) === key)
      .reduce((sum, s) => sum + s.hours, 0);
    result.push({
      date: d,
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      hours,
    });
  }
  return result;
}

export function getProgressPercentage(store) {
  const goals = store.subjectGoals || {};
  const hours = getSubjectHours(store);
  const subjects = Object.keys({ ...hours, ...goals });
  if (subjects.length === 0) return 0;

  let totalPct = 0;
  let count = 0;
  for (const subject of subjects) {
    const goal = goals[subject];
    if (goal && goal > 0) {
      totalPct += Math.min(100, ((hours[subject] || 0) / goal) * 100);
      count++;
    }
  }

  if (count > 0) return Math.round(totalPct / count);

  const targetWeekly = 20;
  const weekHours = getWeeklyHours(store).reduce((s, d) => s + d.hours, 0);
  return Math.min(100, Math.round((weekHours / targetWeekly) * 100));
}

export function getRecommendation(store) {
  const goals = store.subjectGoals || {};
  const hours = getSubjectHours(store);
  const weekStart = startOfDay(new Date());
  weekStart.setDate(weekStart.getDate() - 6);

  const weekBySubject = {};
  for (const s of store.sessions) {
    if (s.archived) continue;
    if (new Date(s.date) >= weekStart) {
      weekBySubject[s.subject] = (weekBySubject[s.subject] || 0) + s.hours;
    }
  }

  let best = null;
  let maxGap = -1;

  for (const subject of store.subjects) {
    const goal = goals[subject] || 0;
    const weekly = weekBySubject[subject] || 0;
    const weeklyGoal = goal > 0 ? goal / 4 : 2;
    const gap = weeklyGoal - weekly;
    if (gap > maxGap) {
      maxGap = gap;
      best = { subject, due: Math.max(0, Math.round(gap * 10) / 10) };
    }
  }

  if (!best || best.due <= 0) {
    const least = Object.entries(hours).sort((a, b) => a[1] - b[1])[0];
    if (least) {
      return { subject: least[0], due: 2, reason: "least studied overall" };
    }
    return { subject: store.subjects[0] || "DSA", due: 2, reason: "start fresh" };
  }

  return { ...best, reason: "behind weekly goal" };
}

export function getBurndownData(store) {
  const result = [];
  const today = startOfDay(new Date());

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    const pending = store.tasks.filter(
      (t) =>
        t.status === "pending" &&
        new Date(t.createdAt) <= endOfDay
    ).length;

    result.push({
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      pending,
    });
  }
  return result;
}

export function getTodaySummary(store) {
  const today = new Date();
  const todaySessions = store.sessions.filter(
    (s) => !s.archived && isSameDay(s.date, today)
  );
  const todayHours = todaySessions.reduce((s, x) => s + x.hours, 0);
  const completedToday = store.tasks.filter(
    (t) => t.status === "completed" && t.completedAt && isSameDay(t.completedAt, today)
  );

  return { todaySessions, todayHours, completedToday };
}
