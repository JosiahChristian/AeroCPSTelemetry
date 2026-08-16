export const DEFAULT_CONFIG = Object.freeze({
  targetAltitude: 50,
  timeStep: 0.02,
  proportionalGain: 0.8,
  derivativeGain: 1.1,
  mass: 5,
  windCoupling: 0.08,
});

export function createState() {
  return { altitude: 0, velocity: 0, windForce: 0, elapsed: 0 };
}

export function stepFlight(state, config = DEFAULT_CONFIG) {
  const error = config.targetAltitude - state.altitude;
  const acceleration = config.proportionalGain * error
    - config.derivativeGain * state.velocity
    + (state.windForce / config.mass) * config.windCoupling;
  const velocity = state.velocity + acceleration * config.timeStep;
  const altitude = Math.max(0, state.altitude + velocity * config.timeStep);
  return {
    altitude,
    velocity: altitude === 0 && velocity < 0 ? 0 : velocity,
    windForce: state.windForce * 0.985,
    elapsed: state.elapsed + config.timeStep,
  };
}

export function injectGust(state, force) {
  if (!Number.isFinite(force)) throw new TypeError("force must be finite");
  return { ...state, windForce: force };
}
