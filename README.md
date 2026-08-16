# AeroCPSTelemetry

Browser-based telemetry and visualization environment for cyber-physical flight dynamics, feedback behavior, and environmental disturbances.

[![Web validation](https://github.com/JosiahChristian/AeroCPSTelemetry/actions/workflows/web-validation.yml/badge.svg)](https://github.com/JosiahChristian/AeroCPSTelemetry/actions/workflows/web-validation.yml)
[![Live application](https://img.shields.io/badge/live-GitHub%20Pages-46d8ff)](https://josiahchristian.github.io/AeroCPSTelemetry/)

## Overview

AeroCPSTelemetry provides an interactive front-end visualization layer for simulated aerospace cyber-physical systems.

The current dashboard renders aircraft state behavior in real time while exposing telemetry associated with altitude tracking and atmospheric crosswind disturbances. The project demonstrates how browser-native visualization can provide an observable interface for dynamic physical-system simulations.

## Current Telemetry

The dashboard currently visualizes:

- altitude target conformance
- aircraft vertical dynamics
- proportional feedback behavior
- atmospheric wind-shear disturbances
- crosswind-induced trajectory displacement
- real-time flight-state rendering
- pause, reset, and explicit gust-injection controls
- altitude, vertical velocity, tracking-error, force, and elapsed-time readouts

## Architecture

### HTML5 Canvas Rendering

The visualization engine uses the HTML5 Canvas API to render aircraft position, target-altitude references, ground geometry, and disturbance-driven displacement directly in the browser.

### Dynamic State Simulation

The browser runtime maintains a simplified flight state consisting of altitude, velocity, target altitude, and environmental disturbance forces.

State variables are advanced continuously using discrete time-step integration.

### Feedback Control

Altitude behavior is driven by proportional-derivative error feedback with
gravity compensation relative to the target altitude.

The resulting control input interacts with gravitational acceleration and simulated wind disturbances to produce the displayed flight trajectory.

### Environmental Disturbance Modeling

Transient crosswind forces are introduced during runtime to perturb the simulated vehicle state.

These disturbances are exposed through the telemetry registry and visually influence aircraft displacement on the flight canvas.

## Repository Structure

```text
.
├── index.html                 # accessible application shell
├── styles.css                # responsive visual system
├── src/app.js                # rendering, controls, and animation loop
├── src/flight-model.js       # deterministic simulation core
├── tests/flight-model.test.js
└── .github/workflows/        # Node-based continuous validation
```

## Run and Test

The application has no runtime dependencies. Serve the repository with any
static HTTP server, then open `index.html`. To run the numerical model tests:

```bash
npm test
```

Node.js 20 or newer is required for the test command.

## Technology

- JavaScript
- HTML5
- CSS3
- Canvas API
- Browser-native simulation
- GitHub Pages
- Node.js built-in test runner

## Related Software

- [**AeroCPSSimulation**](https://github.com/JosiahChristian/AeroCPSSimulation) — C++ flight-dynamics and feedback-control simulation
- [**TelemetryPipelineJava**](https://github.com/JosiahChristian/TelemetryPipelineJava) — Java/Spring telemetry ingestion and persistence backend
- [**BiomedicalTelemetryVisualizer**](https://github.com/JosiahChristian/BiomedicalTelemetryVisualizer) — separate browser-based visualization for biomedical telemetry

## Model Boundary

The browser simulation is a deliberately reduced vertical point-mass model. It
does not reproduce the six-degree-of-freedom dynamics in `AeroCPSSimulation`
and must not be interpreted as a certified flight model or controller.

## Live Application

[Launch Aero CPS Telemetry](https://josiahchristian.github.io/AeroCPSTelemetry/)
