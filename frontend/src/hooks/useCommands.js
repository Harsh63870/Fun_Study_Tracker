import { useMutation } from "@tanstack/react-query";
import { runCommand, exportData } from "../api/tracker";
import { useAppStore } from "../store/useAppStore";
import { invalidateAll } from "../lib/queryClient";

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `study-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function useCommands() {
  const setCommandOutput = useAppStore((s) => s.setCommandOutput);

  const mutation = useMutation({
    mutationFn: async (command) => {
      if (command.trim().toLowerCase() === "reset") {
        if (!confirm("Sab data clear ho jayega. Sure?")) {
          return { type: "cancelled" };
        }
      }

      const result = await runCommand(command);

      if (result.type === "export") {
        downloadJson(result.data);
        return { ...result, message: "JSON export download ho gaya.", level: "success" };
      }

      return result;
    },
    onSuccess: (result) => {
      if (!result || result.type === "empty" || result.type === "cancelled") return;

      if (result.message) {
        setCommandOutput(result.message, result.level || "info");
      }

      if (result.mutated) {
        invalidateAll();
      }
    },
    onError: (err) => {
      setCommandOutput(
        err.response?.data?.error || err.message || "Command failed",
        "error"
      );
    },
  });

  return {
    run: mutation.mutate,
    isPending: mutation.isPending,
  };
}

export function useExport() {
  return useMutation({
    mutationFn: exportData,
    onSuccess: (data) => downloadJson(data),
  });
}
