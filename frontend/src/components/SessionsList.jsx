import { useGsapEntrance } from "../hooks/useGsapEntrance";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SessionsList({ sessions, loading }) {
  const ref = useGsapEntrance([sessions?.length]);

  return (
    <section className="rounded-xl border border-border bg-elevated p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Recent Sessions</h2>
        <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted">
          {sessions?.length ?? 0}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : !sessions?.length ? (
        <p className="text-center text-muted text-sm py-8">No sessions yet. Try: add 3h DSA</p>
      ) : (
        <div ref={ref} className="space-y-2 max-h-80 overflow-y-auto">
          {sessions.slice(0, 20).map((s) => (
            <div
              key={s.id}
              className="flex gap-3 items-start bg-card border border-border rounded-lg p-3"
            >
              <span className="font-mono text-xs text-muted">#{s.id}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{s.subject}</div>
                <div className="text-xs text-muted">
                  {formatDate(s.date)} · {s.time}
                </div>
                {s.notes && <div className="text-xs text-muted italic mt-1">{s.notes}</div>}
              </div>
              <span className="font-mono text-sm text-accent font-semibold">{s.hours}h</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
