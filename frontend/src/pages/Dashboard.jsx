import { useQuery } from "@tanstack/react-query";
import { fetchStats, fetchSessions, fetchTasks } from "../api/tracker";
import { queryKeys } from "../lib/queryClient";
import StatsGrid from "../components/StatsGrid";
import CommandInput from "../components/CommandInput";
import SessionsList from "../components/SessionsList";
import TasksList from "../components/TasksList";
import SubjectChart from "../components/SubjectChart";
import Charts from "../components/Charts";
import DataActions from "../components/DataActions";

export default function Dashboard() {
  const statsQuery = useQuery({ queryKey: queryKeys.stats, queryFn: fetchStats });
  const sessionsQuery = useQuery({ queryKey: queryKeys.sessions, queryFn: fetchSessions });
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks("pending"),
    queryFn: () => fetchTasks("pending"),
  });

  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted text-sm mt-1">
          Type commands — track college &amp; extra courses
        </p>
      </div>

      <StatsGrid stats={stats} loading={statsQuery.isLoading} />
      <CommandInput />

      <div className="grid md:grid-cols-2 gap-4">
        <SessionsList sessions={sessionsQuery.data} loading={sessionsQuery.isLoading} />
        <TasksList tasks={tasksQuery.data} loading={tasksQuery.isLoading} />
      </div>

      <SubjectChart
        breakdown={stats?.subjectBreakdown}
        recommendation={stats?.recommendation}
      />

      <Charts weekly={stats?.weekly} burndown={stats?.burndown} />

      <DataActions />
    </div>
  );
}
