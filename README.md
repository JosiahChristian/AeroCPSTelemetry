# AeroCPSTelemetry

Browser-based telemetry visualization for aerospace cyber-physical simulations, including direct ingestion of the versioned CSV contract emitted by `AeroCPSSimulation` and a tested adapter for `TelemetryPipelineJava`.

[![Web validation](https://github.com/JosiahChristian/AeroCPSTelemetry/actions/workflows/web-validation.yml/badge.svg)](https://github.com/JosiahChristian/AeroCPSTelemetry/actions/workflows/web-validation.yml)
[![Live application](https://img.shields.io/badge/live-GitHub%20Pages-46d8ff)](https://josiahchristian.github.io/AeroCPSTelemetry/)

## Cross-Repository Integration

`AeroCPSSimulation` defines and emits the vertical-flight telemetry contract `aerocps.telemetry.v1`:

```text
schema_version,step,time_s,altitude_m,velocity_mps,target_altitude_m,gravity_mps2
```

The live browser application can import that CSV directly. Imported rows are schema-checked before playback: the parser rejects incompatible headers, unsupported schema versions, non-finite numeric values, non-monotonic steps, and non-monotonic simulation time.

The repository also includes `src/telemetry-pipeline-adapter.js`, a tested mapping from validated AeroCPS samples to the REST admission contract implemented by `TelemetryPipelineJava`.

```text
AeroCPSSimulation
    |
    | aerocps.telemetry.v1 CSV
    v
AeroCPSTelemetry parser
    |
    +--------------------> browser playback + state visualization
    |
    v
TelemetryPipelineJava adapter
    |
    | POST /api/telemetry
    v
TelemetryPipelineJava
```

The adapter maps:

- `step` → `sequenceNumber`
- `altitude_m` → signed `altitude`
- `velocity_mps` → signed `velocity`
- `runId + step` → deterministic `packetId`
- ingestion time → API `timestamp`

That deterministic identity preserves the backend's idempotency semantics when a simulation run is replayed. Tests verify the mapping, including negative vertical state values.

The public GitHub Pages application remains static and does not claim a continuously deployed backend connection. The adapter includes a browser-compatible POST client for deployments where a reachable `TelemetryPipelineJava` instance and appropriate network/CORS configuration are available.

## Two Visualization Modes

### Imported simulator telemetry

Use the file control in the live application to select CSV output produced by the vertical-flight executable in `AeroCPSSimulation`. The dashboard replays the simulator's actual altitude, vertical velocity, target altitude, and elapsed simulation time.

### Built-in browser model

Without an imported CSV, the page runs its original reduced vertical point-mass model with PD feedback, gravity compensation, and optional gust disturbances. This remains a browser-native engineering demonstration and is deliberately labeled separately from imported simulator evidence.

## Repository Structure

```text
.
├── index.html
├── styles.css
├── src/
│   ├── app.js
│   ├── flight-model.js
│   ├── telemetry-parser.js
│   └── telemetry-pipeline-adapter.js
├── tests/
│   ├── flight-model.test.js
│   ├── telemetry-parser.test.js
│   └── telemetry-pipeline-adapter.test.js
└── .github/workflows/
```

## Run and Test

The application has no runtime dependencies. Serve the repository with any static HTTP server and open `index.html`.

Run the numerical-model and telemetry-contract tests with:

```bash
npm test
```

Node.js 20 or newer is required.

## Technology

- JavaScript
- HTML5
- CSS3
- Canvas API
- Browser-native simulation and telemetry playback
- tested REST contract adapter
- GitHub Pages
- Node.js built-in test runner

## Related Software

- [**AeroCPSSimulation**](https://github.com/JosiahChristian/AeroCPSSimulation) — producer of the `aerocps.telemetry.v1` CSV consumed here
- [**TelemetryPipelineJava**](https://github.com/JosiahChristian/TelemetryPipelineJava) — Java/Spring telemetry ingestion and persistence backend with a contract-compatible adapter implemented and tested here
- [**BiomedicalTelemetryVisualizer**](https://github.com/JosiahChristian/BiomedicalTelemetryVisualizer) — separate physiological telemetry visualization

## Model Boundary

Imported `aerocps.telemetry.v1` data represents the vertical-flight contract exposed by `AeroCPSSimulation`. It must not be interpreted as six-degree-of-freedom telemetry. The built-in browser model is independently reduced and does not reproduce the native C++ simulation.

Neither mode represents a certified controller or operational aircraft system.

## Live Application

[Launch Aero CPS Telemetry](https://josiahchristian.github.io/AeroCPSTelemetry/)
