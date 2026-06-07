const STORAGE_KEY = "studyTrackerData";

export const DEFAULT_SUBJECTS = [
  "DSA",
  "DBMS",
  "Web Dev",
  "AI/ML",
  "Cloud",
  "System Design",
  "Competitive Programming",
  "LeetCode",
  "Projects",
];

export function createEmptyStore() {
  return {
    sessions: [],
    tasks: [],
    subjects: [...DEFAULT_SUBJECTS],
    subjectGoals: {},
    nextSessionId: 1,
    nextTaskId: 1,
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStore();
    const data = JSON.parse(raw);
    return {
      ...createEmptyStore(),
      ...data,
      subjects: data.subjects?.length ? data.subjects : [...DEFAULT_SUBJECTS],
    };
  } catch {
    return createEmptyStore();
  }
}

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function exportStore(store) {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `study-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importStore(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.sessions || !data.tasks) {
          reject(new Error("Invalid file format"));
          return;
        }
        resolve({ ...createEmptyStore(), ...data });
      } catch {
        reject(new Error("Could not parse JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function resetStore() {
  const empty = createEmptyStore();
  saveStore(empty);
  return empty;
}
