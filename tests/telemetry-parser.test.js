import test from "node:test";
import assert from "node:assert/strict";
import { parseAeroCpsCsv } from "../src/telemetry-parser.js";

const valid = `schema_version,step,time_s,altitude_m,velocity_mps,target_altitude_m,gravity_mps2\naerocps.telemetry.v1,1,0.100000,0.050000,0.500000,50.000000,-9.810000\naerocps.telemetry.v1,2,0.200000,0.150000,1.000000,50.000000,-9.810000\n`;

test("parses AeroCPSSimulation v1 telemetry", () => {
  const rows = parseAeroCpsCsv(valid);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].step, 2);
  assert.equal(rows[1].altitude, 0.15);
  assert.equal(rows[1].targetAltitude, 50);
});

test("rejects an incompatible schema version", () => {
  assert.throws(() => parseAeroCpsCsv(valid.replace("aerocps.telemetry.v1", "aerocps.telemetry.v2")), /unsupported schema/i);
});

test("rejects non-finite telemetry", () => {
  assert.throws(() => parseAeroCpsCsv(valid.replace("0.500000", "NaN")), /must be finite/i);
});

test("rejects reordered or incompatible headers", () => {
  assert.throws(() => parseAeroCpsCsv(valid.replace("step,time_s", "time_s,step")), /unsupported telemetry header/i);
});

test("rejects non-monotonic steps", () => {
  assert.throws(() => parseAeroCpsCsv(valid.replace("aerocps.telemetry.v1,2,0.200000", "aerocps.telemetry.v1,1,0.200000")), /strictly increasing/i);
});
