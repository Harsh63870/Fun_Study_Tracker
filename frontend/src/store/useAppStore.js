import { create } from "zustand";

export const useAppStore = create((set) => ({
  commandOutput: { text: "", level: "info" },
  setCommandOutput: (text, level = "info") => set({ commandOutput: { text, level } }),
  clearCommandOutput: () => set({ commandOutput: { text: "", level: "info" } }),
}));
