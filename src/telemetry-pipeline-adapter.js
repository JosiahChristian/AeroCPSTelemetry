export function toTelemetryPipelinePacket(sample, options = {}) {
  const {
    deviceId = "aerocps-vertical-flight",
    runId = "aerocps-run",
    timestamp = new Date()
  } = options;

  if (!sample || !Number.isInteger(sample.step) || sample.step < 1) {
    throw new Error("AeroCPS sample must contain a positive integer step");
  }
  if (!Number.isFinite(sample.altitude) || !Number.isFinite(sample.velocity)) {
    throw new Error("AeroCPS altitude and velocity must be finite");
  }
  if (typeof deviceId !== "string" || deviceId.trim().length === 0) {
    throw new Error("deviceId is required");
  }
  if (typeof runId !== "string" || runId.trim().length === 0) {
    throw new Error("runId is required");
  }

  const instant = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(instant.getTime())) {
    throw new Error("timestamp must be a valid date");
  }

  return {
    packetId: `${runId}:${sample.step}`,
    deviceId,
    sequenceNumber: sample.step,
    altitude: sample.altitude,
    velocity: sample.velocity,
    timestamp: instant.toISOString()
  };
}

export async function postTelemetryPipelinePacket(endpoint, sample, options = {}) {
  if (typeof endpoint !== "string" || endpoint.trim().length === 0) {
    throw new Error("TelemetryPipelineJava endpoint is required");
  }

  const payload = toTelemetryPipelinePacket(sample, options);
  const url = `${endpoint.replace(/\/$/, "")}/api/telemetry`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`TelemetryPipelineJava rejected packet (${response.status}): ${detail}`);
  }

  return response.json();
}
