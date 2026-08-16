import test from "node:test";
import assert from "node:assert/strict";
import { createState, injectGust, stepFlight } from "../src/flight-model.js";

test("default state starts at rest on the ground", () => {
  assert.deepEqual(createState(), { altitude: 0, velocity: 0, windForce: 0, elapsed: 0 });
});

test("controller converges near the commanded altitude", () => {
  let state = createState();
  for (let i = 0; i < 3000; i += 1) state = stepFlight(state);
  assert.ok(Math.abs(state.altitude - 50) < 0.01);
  assert.ok(Math.abs(state.velocity) < 0.01);
});

test("ground constraint prevents negative altitude", () => {
  const state = stepFlight({ altitude: 0, velocity: -10, windForce: 0, elapsed: 0 });
  assert.equal(state.altitude, 0);
  assert.equal(state.velocity, 0);
});

test("gust injection is immutable and decays", () => {
  const initial = createState();
  const disturbed = injectGust(initial, 12);
  assert.equal(initial.windForce, 0);
  assert.equal(disturbed.windForce, 12);
  assert.ok(stepFlight(disturbed).windForce < 12);
});

test("invalid gusts are rejected", () => {
  assert.throws(() => injectGust(createState(), Number.NaN), TypeError);
});
