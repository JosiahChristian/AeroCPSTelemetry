# AeroCPSTelemetry

Browser-based telemetry and visualization environment for cyber-physical flight dynamics, feedback behavior, and environmental disturbances.

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

## Architecture

### HTML5 Canvas Rendering

The visualization engine uses the HTML5 Canvas API to render aircraft position, target-altitude references, ground geometry, and disturbance-driven displacement directly in the browser.

### Dynamic State Simulation

The browser runtime maintains a simplified flight state consisting of altitude, velocity, target altitude, and environmental disturbance forces.

State variables are advanced continuously using discrete time-step integration.

### Feedback Control

Altitude behavior is driven by proportional error feedback relative to the target altitude.

The resulting control input interacts with gravitational acceleration and simulated wind disturbances to produce the displayed flight trajectory.

### Environmental Disturbance Modeling

Transient crosswind forces are introduced during runtime to perturb the simulated vehicle state.

These disturbances are exposed through the telemetry registry and visually influence aircraft displacement on the flight canvas.

## Technology

- JavaScript
- HTML5
- CSS3
- Canvas API
- Browser-native simulation
- GitHub Pages

## Related Software

- **AeroCPSSimulation** — C++ flight-dynamics and feedback-control simulation
- **TelemetryPipelineJava** — Java/Spring telemetry ingestion and persistence backend
- **BiomedicalTelemetryVisualizer** — separate browser-based visualization for biomedical telemetry

## Live Application

[Launch Aero CPS Telemetry](https://josiahchristian.github.io/AeroCPSTelemetry/)