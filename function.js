/**
 * makeKnob('#id' or 'id', { min, max, step, value })
 * Usage:
 *   makeKnob('dial-x', { min: 0, max: 100, step: 5, value: 50 });
 *   const v = document.getElementById('dial-x').knob.getValue();
 *   document.getElementById('dial-x').addEventListener('knobchange', e => console.log(e.detail.value));
 */

function makeKnob(id, opts = {}) {
  const {
    min = 0,
    max = 100,
    step = 1,
    value = min
  } = opts;

  const el = typeof id === 'string' ? document.getElementById(id.replace(/^#/, '')) : id;
  if (!el) throw new Error('makeKnob: element not found');

  // Internal state
  const state = {
    min, max, step,
    value: clamp(stepRound(value, step), min, max),
    pointerId: null,
    centerX: 0,
    centerY: 0,
    dragging: false
  };

  // Map value <-> angle over a 270° sweep (-135° .. +135°)
  const A_MIN = -135, A_MAX = 135, A_RANGE = A_MAX - A_MIN;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function stepRound(v, s) { return Number((Math.round(v / s) * s).toFixed(6)); }

  function valueToAngle(v) {
    const frac = (v - state.min) / (state.max - state.min || 1);
    return A_MIN + frac * A_RANGE;
  }

  function angleToValue(a) {
    const ang = clamp(a, A_MIN, A_MAX);
    const frac = (ang - A_MIN) / A_RANGE;
    const raw = state.min + frac * (state.max - state.min);
    return clamp(stepRound(raw, state.step), state.min, state.max);
  }

  function render() {
    el.style.transform = `rotate(${valueToAngle(state.value)}deg)`;
  }

  function onPointerDown(e) {
    state.dragging = true;
    state.pointerId = e.pointerId;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    state.centerX = r.left + r.width / 2;
    state.centerY = r.top + r.height / 2;
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!state.dragging || e.pointerId !== state.pointerId) return;
    const dx = e.clientX - state.centerX;
    const dy = e.clientY - state.centerY;
    const ang = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180
    const newVal = angleToValue(ang);
    if (newVal !== state.value) {
      state.value = newVal;
      render();
      el.dispatchEvent(new CustomEvent('knobchange', { detail: { value: state.value } }));
    }
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (e.pointerId !== state.pointerId) return;
    state.dragging = false;
    try { el.releasePointerCapture(e.pointerId); } catch {}
  }

  // Prevent page scrolling/selection while dragging
  el.style.touchAction = 'none';
  el.style.userSelect = 'none';
  el.style.WebkitUserSelect = 'none';
  el.style.webkitTapHighlightColor = 'transparent';

  // Attach simple API to the element
  el.knob = {
    getValue: () => state.value,
    setValue: (v) => { state.value = clamp(stepRound(v, state.step), state.min, state.max); render(); },
    options: state
  };

  // Events
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);

  // Init
  render();
  return el.knob;
}

/* Example init (uncomment if you want it to run right away)
document.addEventListener('DOMContentLoaded', () => {
  makeKnob('dial-x', { min: 0, max: 100, step: 5, value: 50 });
});
*/

document.addEventListener('DOMContentLoaded', () => {
    makeKnob('rotation-x', { min: 0, max: 100, step: 5, value: 50 });
    makeKnob('rotation-y', { min: 0, max: 100, step: 5, value: 50 });
    makeKnob('rotation-z', { min: 0, max: 100, step: 5, value: 50 });
  });