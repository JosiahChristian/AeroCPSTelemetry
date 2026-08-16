import { DEFAULT_CONFIG, createState, injectGust, stepFlight } from "./flight-model.js";

const canvas = document.querySelector("#flight-canvas");
const context = canvas.getContext("2d");
const fields = Object.fromEntries(["altitude", "velocity", "error", "wind", "elapsed"].map(id => [id, document.querySelector(`#${id}`)]));
const status = document.querySelector("#run-status");
const toggle = document.querySelector("#toggle-button");
let state = createState();
let running = true;
let accumulator = 0;
let previous = performance.now();

function draw() {
  const { width, height } = canvas;
  const groundY = height - 48;
  const scale = (height - 100) / 65;
  const targetY = groundY - DEFAULT_CONFIG.targetAltitude * scale;
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
  context.fillStyle = "#91a4bd"; context.font = "13px ui-monospace"; context.fillText("TARGET 50.0 M", 16, targetY - 10);
  context.fillStyle = "#17253a"; context.fillRect(0, groundY, width, height - groundY);
  context.save(); context.translate(aircraftX, aircraftY); context.fillStyle = "#46d8ff";
  context.fillRect(-34, -4, 68, 8); context.fillRect(-10, -11, 20, 22);
  context.fillRect(-48, -8, 18, 4); context.fillRect(30, -8, 18, 4); context.restore();
}

function renderTelemetry() {
  fields.altitude.textContent = state.altitude.toFixed(2);
  fields.velocity.textContent = state.velocity.toFixed(2);
  fields.error.textContent = (DEFAULT_CONFIG.targetAltitude - state.altitude).toFixed(2);
  fields.wind.textContent = state.windForce.toFixed(2);
  fields.elapsed.textContent = state.elapsed.toFixed(2);
}

function frame(now) {
  const frameSeconds = Math.min((now - previous) / 1000, 0.1); previous = now;
  if (running) {
    accumulator += frameSeconds;
    while (accumulator >= DEFAULT_CONFIG.timeStep) { state = stepFlight(state); accumulator -= DEFAULT_CONFIG.timeStep; }
  }
  draw(); renderTelemetry(); requestAnimationFrame(frame);
}

toggle.addEventListener("click", () => {
  running = !running; toggle.textContent = running ? "Pause" : "Resume";
  status.textContent = running ? "Running" : "Paused";
});
document.querySelector("#disturbance-button").addEventListener("click", () => {
  state = injectGust(state, (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 8));
});
document.querySelector("#reset-button").addEventListener("click", () => { state = createState(); accumulator = 0; });
requestAnimationFrame(frame);
