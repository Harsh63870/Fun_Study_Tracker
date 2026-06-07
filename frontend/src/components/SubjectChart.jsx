export default function SubjectChart({ breakdown, recommendation }) {
  const max = breakdown?.[0]?.hours || 1;

  return (
    <section className="rounded-xl border border-border bg-elevated p-4">
      <h2 className="font-semibold mb-3">Subject Breakdown</h2>

      {!breakdown?.length ? (
        <p className="text-center text-muted text-sm py-6">Subject data will appear here</p>
      ) : (
        <div className="space-y-3">
          {breakdown.map(({ subject, hours }) => (
            <div key={subject} className="grid grid-cols-[90px_1fr_40px] items-center gap-2 text-sm">
              <span className="text-muted truncate" title={subject}>
                {subject}
              </span>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-sky-300 rounded-full transition-all duration-300"
                  style={{ width: `${(hours / max) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs text-right">{hours.toFixed(1)}h</span>
            </div>
          ))}
        </div>
      )}

      {recommendation && (
        <div className="mt-4 p-3 rounded-lg border border-accent/40 bg-accent/10 text-sm">
          💡 <strong className="text-accent">Suggestion:</strong> Aaj{" "}
          <strong>{recommendation.subject}</strong> padho — ~{recommendation.due}h due (
          {recommendation.reason})
        </div>
      )}
    </section>
  );
}
