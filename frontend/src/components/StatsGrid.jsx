import { useGsapEntrance } from "../hooks/useGsapEntrance";

function StatCard({ label, value, sub, accent }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-accent/50 bg-gradient-to-br from-card to-accent/10"
          : "border-border bg-card"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-sm text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export default function StatsGrid({ stats, loading }) {
  const ref = useGsapEntrance([stats]);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard
        label="Total Hours"
        value={`${stats.totalHours.toFixed(1)}h`}
        sub={`Avg ${stats.averagePerDay.toFixed(1)}h/day`}
        accent
      />
      <StatCard
        label="Today"
        value={`${stats.todayHours.toFixed(1)}h`}
        sub={new Date().toLocaleDateString("en-IN", { weekday: "long" })}
      />
      <StatCard label="Streak" value={`${stats.streak} 🔥`} sub="consecutive days" />
      <StatCard label="Progress" value={`${stats.progress}%`} sub="toward goals" />
      <StatCard
        label="Tasks"
        value={`${stats.tasks.rate}%`}
        sub={`${stats.tasks.completed}/${stats.tasks.total} done`}
      />
    </div>
  );
}
