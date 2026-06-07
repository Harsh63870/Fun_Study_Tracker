const PRIORITY_COLOR = {
  high: "text-danger",
  medium: "text-warning",
  low: "text-accent",
};

export default function TasksList({ tasks, loading }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="rounded-xl border border-border bg-elevated p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Pending Tasks</h2>
        <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted">
          {tasks?.length ?? 0}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : !tasks?.length ? (
        <p className="text-center text-muted text-sm py-8">All clear! add task: your next step</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {tasks.map((t) => {
            const overdue = t.deadline && t.deadline < today;
            return (
              <div
                key={t.id}
                className="flex gap-3 items-start bg-card border border-border rounded-lg p-3"
              >
                <span className={`text-sm ${PRIORITY_COLOR[t.priority] || "text-muted"}`}>●</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{t.title}</div>
                  <div className="text-xs text-muted">
                    <span className={PRIORITY_COLOR[t.priority]}>{t.priority}</span>
                    {t.deadline && (
                      <span className={overdue ? " text-danger" : ""}> · due {t.deadline}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
