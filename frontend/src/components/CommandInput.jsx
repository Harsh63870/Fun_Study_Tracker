import { useState } from "react";
import { useCommands } from "../hooks/useCommands";
import { useAppStore } from "../store/useAppStore";
import { useGsapFadeIn } from "../hooks/useGsapEntrance";

const HINTS = ["add 2h DSA", "summary", "list pending", "show stats", "help"];

export default function CommandInput() {
  const [input, setInput] = useState("");
  const { run, isPending } = useCommands();
  const output = useAppStore((s) => s.commandOutput);
  const outputRef = useGsapFadeIn([output.text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    run(input);
    setInput("");
  };

  const runHint = (cmd) => {
    if (isPending) return;
    run(cmd);
  };

  return (
    <section className="rounded-xl border border-border bg-elevated p-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-accent font-semibold text-lg">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try: add 3h DSA · add task: solve 20 problems · show stats'
          className="flex-1 min-w-[200px] bg-surface border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent transition-colors"
          spellCheck={false}
          autoFocus
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-surface font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "..." : "Run"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-3">
        {HINTS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => runHint(cmd)}
            className="font-mono text-xs px-3 py-1 rounded-full border border-border text-muted hover:border-accent hover:text-accent transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {output.text && (
        <pre
          ref={outputRef}
          className={`mt-3 font-mono text-sm whitespace-pre-wrap break-words ${
            output.level === "success"
              ? "text-success"
              : output.level === "error"
                ? "text-danger"
                : "text-muted"
          }`}
        >
          {output.text}
        </pre>
      )}
    </section>
  );
}
