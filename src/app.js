import { DEFAULT_CONFIG, createState, injectGust, stepFlight } from "./flight-model.js";
import { AEROCPS_SCHEMA_VERSION, parseAeroCpsCsv } from "./telemetry-parser.js";

const canvas = document.querySelector("#flight-canvas");
const context = canvas.getContext("2d");
const fields = Object.fromEntries(["altitude", "velocity", "error", "wind", "elapsed"].map(id => [id, document.querySelector(`#${id}`)]));
const status = document.querySelector("#run-status");
const toggle = document.querySelector("#toggle-button");
const disturbance = document.querySelector("#disturbance-button");
const fileInput = document.querySelector("#telemetry-file");
const sourceName = document.querySelector("#source-name");
const schemaName = document.querySelector("#schema-name");
const sourceNote = document.querySelector("#source-note");
const targetAltitude = document.querySelector("#target-altitude");

let state = createState();
let running = true;
let accumulator = 0;
let previous = performance.now();
let importedRows = null;
let importedIndex = 0;
let playbackElapsed = 0;

function activeTarget() {
  return importedRows ? importedRows[importedIndex].targetAltitude : DEFAULT_CONFIG.targetAltitude;
}

function draw() {
  const { width, height } = canvas;
  const groundY = height - 48;
  const target = activeTarget();
  const ceiling = Math.max(65, target * 1.3, state.altitude * 1.15);
  const scale = (height - 100) / ceiling;
  const targetY = groundY - target * scale;
  const aircraftY = groundY - state.altitude * scale;
  const aircraftX = width / 2 + state.windForce * 2.2;

  context.clearRect(0, 0, width, height);
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#071b34"); sky.addColorStop(1, "#050a13");
  context.fillStyle = sky; context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(70,216,255,.18)"; context.lineWidth = 1;
  for (let y = 40; y < groundY; y += 52) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
  context.setLineDash([9, 8]); context.strokeStyle = "#5a8cff"; context.lineWidth = 2;
  context.beginPath(); context.moveTo(0, targetY); context.lineTo(width, targetY); context.stroke(); context.setLineDash([]);
  context.fillStyle = "#91a4bd"; context.font = "13px ui-monospace"; context.fillText(`TARGET ${target.toFixed(1)} M`, 16, targetY - 10);
  context.fillStyle = "#17253a"; context.fillRect(0, groundY, width, height - groundY);
  context.save(); context.translate(aircraftX, aircraftY); context.fillStyle = "#46d8ff";
  context.fillRect(-34, -4, 68, 8); context.fillRect(-10, -11, 20, 22);
  context.fillRect(-48, -8, 18, 4); context.fillRect(30, -8, 18, 4); context.restore();
}

function renderTelemetry() {
  const target = activeTarget();
  fields.altitude.textContent = state.altitude.toFixed(2);
  fields.velocity.textContent = state.velocity.toFixed(2);
  fields.error.textContent = (target - state.altitude).toFixed(2);
  fields.wind.textContent = state.windForce.toFixed(2);
  fields.elapsed.textContent = state.elapsed.toFixed(2);
  targetAltitude.textContent = target.toFixed(1);
}

function applyImportedRow(row) {
  state = {
    altitude: row.altitude,
    velocity: row.velocity,
    windForce: 0,
    elapsed: row.time
  };
}

function advanceImported(frameSeconds) {
  if (!importedRows || importedIndex >= importedRows.length - 1) return;
  playbackElapsed += frameSeconds;
  while (importedIndex < importedRows.length - 1 && importedRows[importedIndex + 1].time <= playbackElapsed) {
    importedIndex += 1;
    applyImportedRow(importedRows[importedIndex]);
  }
  if (importedIndex === importedRows.length - 1) {
    running = false;
    toggle.textContent = "Replay";
    status.textContent = "AeroCPSSimulation replay complete";
  }
}

function frame(now) {
  const frameSeconds = Math.min((now - previous) / 1000, 0.1); previous = now;
  if (running) {
    if (importedRows) {
      advanceImported(frameSeconds);
    } else {
      accumulator += frameSeconds;
      while (accumulator >= DEFAULT_CONFIG.timeStep) { state = stepFlight(state); accumulator -= DEFAULT_CONFIG.timeStep; }
    }
  }
  draw(); renderTelemetry(); requestAnimationFrame(frame);
}

function resetImported() {
  importedIndex = 0;
  playbackElapsed = importedRows[0].time;
  applyImportedRow(importedRows[0]);
  running = true;
  toggle.textContent = "Pause";
  status.textContent = "Replaying AeroCPSSimulation telemetry";
}

toggle.addEventListener("click", () => {
  if (importedRows && importedIndex === importedRows.length - 1) {
    resetImported();
    return;
  }
  running = !running;
  toggle.textContent = running ? "Pause" : "Resume";
  status.textContent = running
    ? (importedRows ? "Replaying AeroCPSSimulation telemetry" : "Running browser model")
    : "Paused";
});

disturbance.addEventListener("click", () => {
  if (importedRows) return;
  state = injectGust(state, (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 8));
});

document.querySelector("#reset-button").addEventListener("click", () => {
  if (importedRows) {
    resetImported();
  } else {
    state = createState(); accumulator = 0;
  }
});

fileInput.addEventListener("change", async event => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    const rows = parseAeroCpsCsv(await file.text());
    importedRows = rows;
    resetImported();
    sourceName.textContent = "AeroCPSSimulation CSV";
    schemaName.textContent = AEROCPS_SCHEMA_VERSION;
    sourceNote.textContent = `${rows.length} schema-validated simulator rows loaded from ${file.name}.`;
    disturbance.disabled = true;
  } catch (error) {
    status.textContent = `Import rejected: ${error.message}`;
    fileInput.value = "";
  }
});

requestAnimationFrame(frame);
