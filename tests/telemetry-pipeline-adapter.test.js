import test from "node:test";
import assert from "node:assert/strict";
import { toTelemetryPipelinePacket } from "../src/telemetry-pipeline-adapter.js";

test("maps AeroCPS state into TelemetryPipelineJava admission contract", () => {
  const payload = toTelemetryPipelinePacket(
    { step: 42, altitude: -12.5, velocity: -3.4 },
    {
      deviceId: "aerocps-test-vehicle",
      runId: "run-2026-08-17",
      timestamp: "2026-08-17T05:50:00Z"
    }
  );

  assert.deepEqual(payload, {
    packetId: "run-2026-08-17:42",
    deviceId: "aerocps-test-vehicle",
    sequenceNumber: 42,
    altitude: -12.5,
    velocity: -3.4,
    timestamp: "2026-08-17T05:50:00.000Z"
  });
});

test("uses deterministic packet identity for replay idempotency", () => {
  const sample = { step: 7, altitude: 100, velocity: 0 };
  const options = {
    runId: "repeatable-run",
    timestamp: "2026-08-17T05:50:00Z"
  };

  assert.equal(
    toTelemetryPipelinePacket(sample, options).packetId,
    toTelemetryPipelinePacket(sample, options).packetId
  );
});

test("rejects malformed adapter inputs", () => {
  assert.throws(
    () => toTelemetryPipelinePacket({ step: 0, altitude: 1, velocity: 2 }),
    /positive integer step/
  );
  assert.throws(
    () => toTelemetryPipelinePacket({ step: 1, altitude: Number.NaN, velocity: 2 }),
    /must be finite/
  );
});
