import { useQuery } from "@tanstack/react-query";
import { useGsapEntrance } from "../hooks/useGsapEntrance";
import { fetchStats } from "../api/tracker";
import { queryKeys } from "../lib/queryClient";
import StatsGrid from "../components/StatsGrid";
import SubjectChart from "../components/SubjectChart";
import Charts from "../components/Charts";

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.stats,
    queryFn: fetchStats,
  });

  const ref = useGsapEntrance([stats]);

  return (
    <div ref={ref} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted text-sm mt-1">Detailed insights &amp; trends</p>
      </div>

      <StatsGrid stats={stats} loading={isLoading} />

      {stats && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-elevated p-4 space-y-3">
            <h2 className="font-semibold">Overview</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-card rounded-lg p-3 border border-border">
                <div className="text-muted text-xs">Most Studied</div>
                <div className="font-semibold mt-1">
                  {stats.mostStudied
                    ? `${stats.mostStudied.subject} (${stats.mostStudied.hours.toFixed(1)}h)`
                    : "—"}
                </div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <div className="text-muted text-xs">Task Completion</div>
                <div className="font-semibold mt-1">
                  {stats.tasks.completed}/{stats.tasks.total} ({stats.tasks.rate}%)
                </div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <div className="text-muted text-xs">Weekly Total</div>
                <div className="font-semibold mt-1">
                  {stats.weekly.reduce((s, d) => s + d.hours, 0).toFixed(1)}h
                </div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <div className="text-muted text-xs">Study Streak</div>
                <div className="font-semibold mt-1">{stats.streak} days 🔥</div>
              </div>
            </div>
          </div>

          <SubjectChart
            breakdown={stats.subjectBreakdown}
            recommendation={stats.recommendation}
          />
        </div>
      )}

      <Charts weekly={stats?.weekly} burndown={stats?.burndown} />
    </div>
  );
}
