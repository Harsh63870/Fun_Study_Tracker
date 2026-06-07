import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useExport } from "../hooks/useCommands";
import { importData } from "../api/tracker";
import { invalidateAll } from "../lib/queryClient";
import { useAppStore } from "../store/useAppStore";

export default function DataActions() {
  const fileRef = useRef(null);
  const exportMutation = useExport();
  const setCommandOutput = useAppStore((s) => s.setCommandOutput);

  const importMutation = useMutation({
    mutationFn: importData,
    onSuccess: () => {
      invalidateAll();
      setCommandOutput("Data import successful! ✓", "success");
    },
    onError: (err) => {
      setCommandOutput(err.response?.data?.error || "Import failed", "error");
    },
  });

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        importMutation.mutate(data);
      } catch {
        setCommandOutput("Could not parse JSON", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <footer className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-border">
      <button
        onClick={() => exportMutation.mutate()}
        disabled={exportMutation.isPending}
        className="text-sm px-4 py-2 rounded-lg border border-border text-muted hover:border-accent hover:text-accent transition-colors"
      >
        Export JSON
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="text-sm px-4 py-2 rounded-lg border border-border text-muted hover:border-accent hover:text-accent transition-colors"
      >
        Import JSON
      </button>
      <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
      <span className="text-xs text-muted ml-auto">Data saved to SQLite via API</span>
    </footer>
  );
}
