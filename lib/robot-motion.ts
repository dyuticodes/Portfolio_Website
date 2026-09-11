export type Spring = { value: number; velocity: number };

// Analytic critically damped spring: stable at different refresh rates, no overshoot.
export function stepSpring(state: Spring, target: number, frequency: number, delta: number) {
  const offset = state.value - target;
  const impulse = state.velocity + frequency * offset;
  const decay = Math.exp(-frequency * delta);
  state.value = target + (offset + impulse * delta) * decay;
  state.velocity = (state.velocity - frequency * impulse * delta) * decay;
  return state.value;
}

// Gaze is measured from the projected eyes, not from the middle of the whole page.
export function gazeFromPointer(x: number, y: number, eyeX: number, eyeY: number, distance: number) {
  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
  const pitch = Math.atan2(y - eyeY, distance * 0.55) * 0.85;
  return {
    yaw: clamp(Math.atan2(x - eyeX, distance), 0.62),
    pitch: clamp(pitch, 0.65),
  };
}

// Monotonic filtering: no momentum, overshoot, or bobbing on direction changes.
export function smoothTracking(current: number, target: number, delta: number) {
  const next = current + (target - current) * (1 - Math.exp(-20 * delta));
  return Math.abs(next - target) < 0.00005 ? target : next;
}
