// How much of a letter stroke a finger drag has covered, in drawing order.
(function (root) {
  'use strict';

  const COMPLETE = 0.8;
  const STROKE_STEP = 2;
  const DRAG_STEP = 3;
  const WINDOW = 10; // stroke points the finger may run ahead of the last covered one

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  // Points every `step` units along a polyline, keeping both ends.
  function resample(points, step) {
    if (points.length < 2) return points.slice();
    const out = [points[0]];
    let carry = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const len = dist(a, b);
      let t = step - carry;
      while (t <= len) {
        out.push([a[0] + ((b[0] - a[0]) * t) / len, a[1] + ((b[1] - a[1]) * t) / len]);
        t += step;
      }
      carry = len - (t - step);
    }
    const last = points[points.length - 1];
    if (dist(out[out.length - 1], last) > 0.01) out.push(last);
    return out;
  }

  function coverage(stroke, dragPoints, tolerance = 12) {
    const sp = resample(stroke, STROKE_STEP);
    const drag = resample(dragPoints, DRAG_STEP);
    let k = 0;
    for (const d of drag) {
      // The finger's place on the stroke is its nearest point anywhere along it;
      // it only counts when that place is just ahead of what's already covered.
      let best = -1;
      let bestDist = Infinity;
      for (let j = 0; j < sp.length; j++) {
        const dd = dist(sp[j], d);
        if (dd < bestDist) { bestDist = dd; best = j; }
      }
      if (bestDist <= tolerance && best >= k && best < k + WINDOW) k = best + 1;
      if (k >= sp.length) break;
    }
    return k / sp.length;
  }

  const api = { COMPLETE, coverage, resample };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.AA = root.AA || {}).traceMatch = api;
})(typeof self !== 'undefined' ? self : globalThis);
