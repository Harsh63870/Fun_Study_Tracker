import { parseCommand } from "./commands.js";
import {
  exportStore,
  importStore,
  loadStore,
  resetStore,
  saveStore,
} from "./storage.js";
import { renderAll, showOutput } from "./ui.js";

let store = loadStore();

function persist() {
  saveStore(store);
  renderAll(store);
}

function runCommand(raw) {
  const result = parseCommand(raw, store);

  switch (result.type) {
    case "empty":
      return;
    case "message":
      showOutput(result.text, result.level);
      return;
    case "reset":
      if (confirm("Sab data clear ho jayega. Sure?")) {
        store = resetStore();
        renderAll(store);
        showOutput("Sab clear ho gaya. Fresh start! 🔄", "success");
      }
      return;
    case "export":
      exportStore(store);
      showOutput("JSON export download ho gaya.", "success");
      return;
    case "mutate":
      persist();
      showOutput(result.message, result.level);
      return;
    default:
      return;
  }
}

document.getElementById("commandForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("commandInput");
  const cmd = input.value;
  if (!cmd.trim()) return;
  runCommand(cmd);
  input.value = "";
  input.focus();
});

document.querySelectorAll(".hint-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const cmd = chip.dataset.cmd;
    document.getElementById("commandInput").value = cmd;
    runCommand(cmd);
    document.getElementById("commandInput").value = "";
  });
});

document.getElementById("exportBtn").addEventListener("click", () => {
  exportStore(store);
  showOutput("JSON export download ho gaya.", "success");
});

document.getElementById("importInput").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    store = await importStore(file);
    persist();
    showOutput("Data import successful! ✓", "success");
  } catch (err) {
    showOutput(err.message, "error");
  }
  e.target.value = "";
});

window.addEventListener("resize", () => renderAll(store));

renderAll(store);
document.getElementById("commandInput").focus();
