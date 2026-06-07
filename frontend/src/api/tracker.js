import api from "./client";

export async function fetchStats() {
  const { data } = await api.get("/stats");
  return data;
}

export async function fetchSessions() {
  const { data } = await api.get("/sessions");
  return data;
}

export async function fetchTasks(status) {
  const { data } = await api.get("/tasks", { params: status ? { status } : {} });
  return data;
}

export async function runCommand(command) {
  const { data } = await api.post("/commands", { command });
  return data;
}

export async function exportData() {
  const { data } = await api.get("/data/export");
  return data;
}

export async function importData(payload) {
  const { data } = await api.post("/data/import", payload);
  return data;
}
