import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/robot-motion.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const context = { exports: {} };
vm.runInNewContext(compiled.outputText, context);
const { gazeFromPointer, stepSpring } = context.exports;
const centred = gazeFromPointer(900, 250, 900, 250, 500);
assert.equal(centred.yaw, 0);
assert.equal(centred.pitch, 0);
assert.ok(gazeFromPointer(100, 250, 900, 250, 500).yaw < 0, 'Look towards a pointer left of the eyes');
assert.ok(gazeFromPointer(1300, 250, 900, 250, 500).yaw > 0, 'Look towards a pointer right of the eyes');
assert.ok(gazeFromPointer(900, 600, 900, 250, 500).pitch > 0, 'Look down for a pointer below the eyes');
assert.ok(gazeFromPointer(900, 50, 900, 250, 500).pitch < 0, 'Look up for a pointer above the eyes');
assert.ok(gazeFromPointer(1000, 40, 1000, 300, 550).pitch < -0.6, 'Look clearly upward when the cursor is over the navbar');
const extreme = gazeFromPointer(100000, 100000, 900, 250, 500);
assert.ok(extreme.yaw <= 0.62 && extreme.pitch <= 0.65, 'Keep the neck within natural bounds');
function simulate(fps) {
  const state = { value: 0, velocity: 0 };
  for (let frame = 0; frame < fps; frame++) {
    stepSpring(state, 0.5, 17, 1 / fps);
    assert.ok(state.value >= 0 && state.value <= 0.5, 'Do not overshoot');
  }
  return state.value;
}
assert.ok(Math.abs(simulate(30) - simulate(120)) < 1e-8, 'Motion should not depend on refresh rate');
assert.ok(simulate(60) > 0.499, 'Converge promptly');
console.log('Passed: eye-relative gaze direction, natural rotation limits, critically damped convergence, frame-rate independence.');

const { smoothTracking } = context.exports;
let rotation = 0;
for (const target of [0.6, -0.6, 0.3, 0]) {
  for (let i = 0; i < 80; i++) {
    const previous = rotation;
    rotation = smoothTracking(rotation, target, 1 / 60);
    assert.ok(rotation >= Math.min(previous, target) - 1e-12 && rotation <= Math.max(previous, target) + 1e-12, 'Reversing gaze must not overshoot or wobble');
  }
  assert.equal(rotation, target);
}
assert.equal(smoothTracking(0, 0, 1 / 60), 0, 'A stationary pointer must leave the robot still');
console.log('Passed: monotonic gaze changes and stationary rest.');
