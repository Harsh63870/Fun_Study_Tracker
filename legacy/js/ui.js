import {
  getAverageHoursPerDay,
  getBurndownData,
  getProgressPercentage,
  getRecommendation,
  getStudyStreak,
  getSubjectHours,
  getTaskCompletionRate,
  getTodayHours,
  getTotalHours,
  getWeeklyHours,
} from "./stats.js";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function renderStats(store) {
  const grid = document.getElementById("statsGrid");
  const total = getTotalHours(store);
  const today = getTodayHours(store);
  const streak = getStudyStreak(store);
  const progress = getProgressPercentage(store);
  const tasks = getTaskCompletionRate(store);
  const avg = getAverageHoursPerDay(store);

  grid.innerHTML = `
    <div class="stat-card accent">
      <div class="label">Total Hours</div>
      <div class="value">${total.toFixed(1)}h</div>
      <div class="sub">Avg ${avg.toFixed(1)}h/day</div>
    </div>
    <div class="stat-card">
      <div class="label">Today</div>
      <div class="value">${today.toFixed(1)}h</div>
      <div class="sub">${new Date().toLocaleDateString("en-IN", { weekday: "long" })}</div>
    </div>
    <div class="stat-card">
      <div class="label">Streak</div>
      <div class="value">${streak} 🔥</div>
      <div class="sub">consecutive days</div>
    </div>
    <div class="stat-card">
      <div class="label">Progress</div>
      <div class="value">${progress}%</div>
      <div class="sub">toward goals</div>
    </div>
    <div class="stat-card">
      <div class="label">Tasks</div>
      <div class="value">${tasks.rate}%</div>
      <div class="sub">${tasks.completed}/${tasks.total} done</div>
    </div>
  `;
}

export function renderSessions(store) {
  const list = document.getElementById("sessionsList");
  const count = document.getElementById("sessionCount");
  const active = store.sessions.filter((s) => !s.archived);
  count.textContent = active.length;

  if (!active.length) {
    list.innerHTML = `<div class="empty-state">No sessions yet. Try: add 3h DSA</div>`;
    return;
  }

  list.innerHTML = active
    .slice(0, 20)
    .map(
      (s) => `
    <div class="session-item${s.archived ? " archived" : ""}">
      <span class="session-id">#${s.id}</span>
      <div class="session-body">
        <div class="session-subject">${escapeHtml(s.subject)}</div>
        <div class="session-meta">${formatDate(s.date)} · ${s.time}</div>
        ${s.notes ? `<div class="session-notes">${escapeHtml(s.notes)}</div>` : ""}
      </div>
      <span class="session-hours">${s.hours}h</span>
    </div>`
    )
    .join("");
}

export function renderTasks(store) {
  const list = document.getElementById("tasksList");
  const count = document.getElementById("taskCount");
  const pending = store.tasks.filter((t) => t.status === "pending");
  count.textContent = pending.length;

  if (!pending.length) {
    list.innerHTML = `<div class="empty-state">All clear! add task: your next step</div>`;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  list.innerHTML = pending
    .map((t) => {
      const overdue = t.deadline && t.deadline < today;
      return `
    <div class="task-item">
      <span class="task-priority priority-${t.priority}">●</span>
      <div class="task-body">
        <div class="task-title">${escapeHtml(t.title)}</div>
        <div class="task-meta">
          <span class="priority-${t.priority}">${t.priority}</span>
          ${t.deadline ? `<span class="task-deadline${overdue ? " overdue" : ""}"> · due ${t.deadline}</span>` : ""}
        </div>
      </div>
    </div>`;
    })
    .join("");
}

export function renderSubjectChart(store) {
  const chart = document.getElementById("subjectChart");
  const hours = getSubjectHours(store);
  const entries = Object.entries(hours).sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    chart.innerHTML = `<div class="empty-state">Subject data will appear here</div>`;
    return;
  }

  const max = entries[0][1] || 1;
  chart.innerHTML = entries
    .map(
      ([name, h]) => `
    <div class="subject-bar-row">
      <span class="subject-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(h / max) * 100}%"></div></div>
      <span class="subject-hours">${h.toFixed(1)}h</span>
    </div>`
    )
    .join("");
}

export function renderRecommendation(store) {
  const el = document.getElementById("recommendation");
  const rec = getRecommendation(store);
  el.innerHTML = `💡 <strong>Suggestion:</strong> Aaj <strong>${escapeHtml(rec.subject)}</strong> padho — ~${rec.due}h due (${rec.reason})`;
}

function drawBarChart(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const pad = { top: 20, right: 12, bottom: 28, left: 36 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const max = Math.max(...values, 1);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#8b949e";
  ctx.font = "11px Outfit, sans-serif";

  const barW = chartW / values.length - 8;

  values.forEach((val, i) => {
    const barH = (val / max) * chartH;
    const x = pad.left + i * (barW + 8) + 4;
    const y = pad.top + chartH - barH;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 3);
    ctx.fill();

    ctx.fillStyle = "#8b949e";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + barW / 2, h - 8);

    if (val > 0) {
      ctx.fillStyle = "#e6edf3";
      ctx.fillText(val.toFixed(1), x + barW / 2, y - 4);
    }
  });
}

function drawLineChart(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const pad = { top: 16, right: 12, bottom: 28, left: 36 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const max = Math.max(...values, 1);

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "#30363d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  if (values.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  values.forEach((val, i) => {
    const x = pad.left + (i / (values.length - 1)) * chartW;
    const y = pad.top + chartH - (val / max) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  values.forEach((val, i) => {
    const x = pad.left + (i / (values.length - 1)) * chartW;
    const y = pad.top + chartH - (val / max) * chartH;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8b949e";
    ctx.font = "11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x, h - 8);
  });
}

export function renderCharts(store) {
  const week = getWeeklyHours(store);
  drawBarChart(
    "weeklyChart",
    week.map((d) => d.label),
    week.map((d) => d.hours),
    "#58a6ff"
  );

  const burndown = getBurndownData(store);
  drawLineChart(
    "burndownChart",
    burndown.map((d) => d.label),
    burndown.map((d) => d.pending),
    "#3fb950"
  );
}

export function renderAll(store) {
  renderStats(store);
  renderSessions(store);
  renderTasks(store);
  renderSubjectChart(store);
  renderRecommendation(store);
  renderCharts(store);
}

export function showOutput(text, level = "info") {
  const el = document.getElementById("commandOutput");
  el.textContent = text;
  el.className = `command-output ${level}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
