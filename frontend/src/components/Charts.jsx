import { useEffect, useRef } from "react";

function drawBarChart(canvas, labels, values, color) {
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
    ctx.font = "11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + barW / 2, h - 8);

    if (val > 0) {
      ctx.fillStyle = "#e6edf3";
      ctx.fillText(val.toFixed(1), x + barW / 2, y - 4);
    }
  });
}

function drawLineChart(canvas, labels, values, color) {
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

export default function Charts({ weekly, burndown }) {
  const weeklyRef = useRef(null);
  const burndownRef = useRef(null);

  useEffect(() => {
    if (weeklyRef.current && weekly?.length) {
      drawBarChart(
        weeklyRef.current,
        weekly.map((d) => d.label),
        weekly.map((d) => d.hours),
        "#58a6ff"
      );
    }
  }, [weekly]);

  useEffect(() => {
    if (burndownRef.current && burndown?.length) {
      drawLineChart(
        burndownRef.current,
        burndown.map((d) => d.label),
        burndown.map((d) => d.pending),
        "#3fb950"
      );
    }
  }, [burndown]);

  return (
    <section className="rounded-xl border border-border bg-elevated p-4">
      <h2 className="font-semibold mb-3">Weekly Trend</h2>
      <canvas ref={weeklyRef} className="w-full h-40" />

      <h3 className="font-medium text-muted text-sm mt-4 mb-2">Task Burndown (7 days)</h3>
      <canvas ref={burndownRef} className="w-full h-32" />
    </section>
  );
}
