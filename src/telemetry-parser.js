export const AEROCPS_SCHEMA_VERSION = "aerocps.telemetry.v1";
export const AEROCPS_HEADER = [
  "schema_version",
  "step",
  "time_s",
  "altitude_m",
  "velocity_mps",
  "target_altitude_m",
  "gravity_mps2"
];

function parseFinite(value, field, rowNumber) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Row ${rowNumber}: ${field} must be finite`);
  }
  return number;
}

export function parseAeroCpsCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("Telemetry CSV must contain a header and at least one data row");
  }

  const header = lines[0].split(",").map(value => value.trim());
  if (header.length !== AEROCPS_HEADER.length || header.some((value, index) => value !== AEROCPS_HEADER[index])) {
    throw new Error(`Unsupported telemetry header. Expected ${AEROCPS_HEADER.join(",")}`);
  }

  let previousStep = 0;
  let previousTime = -Infinity;

  return lines.slice(1).map((line, index) => {
    const rowNumber = index + 2;
    const values = line.split(",").map(value => value.trim());
    if (values.length !== AEROCPS_HEADER.length) {
      throw new Error(`Row ${rowNumber}: expected ${AEROCPS_HEADER.length} fields`);
    }
    if (values[0] !== AEROCPS_SCHEMA_VERSION) {
      throw new Error(`Row ${rowNumber}: unsupported schema ${values[0]}`);
    }

    const step = parseFinite(values[1], "step", rowNumber);
    const time = parseFinite(values[2], "time_s", rowNumber);
    const altitude = parseFinite(values[3], "altitude_m", rowNumber);
    const velocity = parseFinite(values[4], "velocity_mps", rowNumber);
    const targetAltitude = parseFinite(values[5], "target_altitude_m", rowNumber);
    const gravity = parseFinite(values[6], "gravity_mps2", rowNumber);

    if (!Number.isInteger(step) || step <= previousStep) {
      throw new Error(`Row ${rowNumber}: step must be a strictly increasing positive integer`);
    }
    if (time <= previousTime) {
      throw new Error(`Row ${rowNumber}: time_s must be strictly increasing`);
    }

    previousStep = step;
    previousTime = time;
    return { schemaVersion: values[0], step, time, altitude, velocity, targetAltitude, gravity };
  });
}
