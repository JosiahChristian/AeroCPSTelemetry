// Establish connections to DOM elements
const canvas = document.getElementById('droneCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const altReadout = document.getElementById('alt-readout')!;
const velReadout = document.getElementById('vel-readout')!;

// Drone Kinematics State variables
let altitude = 0.0;
let velocity = 0.0;
const targetAltitude = 50.0;
const timeStep = 0.05; // Telemetry refresh interval

function runTelemetryLoop() {
    // 1. Math Proportional Control Feedback Loop
    let error = targetAltitude - altitude;
    let thrust = error * 0.5;
    let gravity = -9.81;
    let acceleration = thrust + gravity;

    // 2. Physics Integrator
    velocity += acceleration * timeStep;
    altitude += velocity * timeStep;

    if (altitude < 0.0) {
        altitude = 0.0;
        velocity = 0.0;
    }

    // 3. Update Numeric Indicators
    altReadout.textContent = altitude.toFixed(2);
    velReadout.textContent = velocity.toFixed(2);

    // 4. Render Visual Drone Canvas Animate Frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Map physical meters to canvas pixels (Scale: 5 pixels per meter)
    // Canvas (0,0) is top-left, so we subtract from canvas height to draw ground-up
    let droneY = canvas.height - 40 - (altitude * 5); 

    // Draw Ground Indicator Line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.stroke();

    // Draw Target Altitude Dotted Reference Line
    let targetY = canvas.height - 40 - (targetAltitude * 5);
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(canvas.width, targetY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line style

    // Draw Quadcopter Graphic Unit
    ctx.fillStyle = '#38bdf8';
    // Drone Central Body
    ctx.fillRect(canvas.width / 2 - 20, droneY, 40, 10);
    // Left Rotor Frame
    ctx.fillRect(canvas.width / 2 - 40, droneY - 5, 20, 5);
    // Right Rotor Frame
    ctx.fillRect(canvas.width / 2 + 20, droneY - 5, 20, 5);

    // Trigger next paint frame recursive loop
    setTimeout(runTelemetryLoop, timeStep * 1000);
}

// Start simulation loop stream on load
runTelemetryLoop();
