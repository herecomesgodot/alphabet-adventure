// Capital-letter strokes in a 100×100 box, in teaching order and direction.
// Used both to draw the letters and as the paths a finger traces.
(function (root) {
  'use strict';

  // Elliptical arc; angles in degrees, 0 = right, 90 = down (screen y grows downward).
  // Decreasing angles run counter-clockwise on screen.
  function arc(cx, cy, rx, ry, from, to) {
    const steps = Math.max(2, Math.ceil((Math.abs(to - from) * Math.PI / 180) * Math.max(rx, ry) / 6));
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
      pts.push([+(cx + rx * Math.cos(a)).toFixed(1), +(cy + ry * Math.sin(a)).toFixed(1)]);
    }
    return pts;
  }

  const join = (...parts) => parts.flat();
  const bowl = (y0, y1, x0, x1) => {
    const r = (y1 - y0) / 2;
    return join([[x0, y0], [x1 - r, y0]], arc(x1 - r, y0 + r, r, r, -90, 90), [[x0, y1]]);
  };

  const S = {
    A: [[[50, 10], [20, 90]], [[50, 10], [80, 90]], [[32, 62], [68, 62]]],
    B: [[[25, 10], [25, 90]], join(bowl(10, 50, 25, 72).slice(0, -1), [[25, 50]], bowl(50, 90, 25, 78).slice(1))],
    C: [arc(55, 50, 33, 40, -40, -320)],
    D: [[[25, 10], [25, 90]], join([[25, 10], [45, 10]], arc(45, 50, 35, 40, -90, 90), [[25, 90]])],
    E: [[[25, 10], [25, 90]], [[25, 10], [75, 10]], [[25, 50], [65, 50]], [[25, 90], [75, 90]]],
    F: [[[25, 10], [25, 90]], [[25, 10], [75, 10]], [[25, 50], [65, 50]]],
    G: [join(arc(52, 50, 32, 40, -40, -360), [[60, 50]])],
    H: [[[25, 10], [25, 90]], [[75, 10], [75, 90]], [[25, 50], [75, 50]]],
    I: [[[50, 10], [50, 90]], [[30, 10], [70, 10]], [[30, 90], [70, 90]]],
    J: [join([[65, 10], [65, 70]], arc(45, 70, 20, 20, 0, 180))],
    K: [[[25, 10], [25, 90]], [[75, 10], [25, 55]], [[40, 42], [75, 90]]],
    L: [[[25, 10], [25, 90], [75, 90]]],
    M: [[[20, 10], [20, 90]], [[20, 10], [50, 60], [80, 10], [80, 90]]],
    N: [[[25, 10], [25, 90]], [[25, 10], [75, 90], [75, 10]]],
    O: [arc(50, 50, 32, 40, -90, -450)],
    P: [[[25, 10], [25, 90]], bowl(10, 50, 25, 72)],
    Q: [arc(50, 50, 32, 40, -90, -450), [[58, 70], [82, 92]]],
    R: [[[25, 10], [25, 90]], bowl(10, 50, 25, 72), [[45, 50], [75, 90]]],
    S: [join(arc(50, 30, 25, 20, -30, -270), arc(50, 70, 25, 20, -90, 150).slice(1))],
    T: [[[20, 10], [80, 10]], [[50, 10], [50, 90]]],
    U: [join([[25, 10], [25, 65]], arc(50, 65, 25, 25, 180, 0), [[75, 10]])],
    V: [[[20, 10], [50, 90], [80, 10]]],
    W: [[[15, 10], [32, 90], [50, 35], [68, 90], [85, 10]]],
    X: [[[22, 10], [78, 90]], [[78, 10], [22, 90]]],
    Y: [[[22, 10], [50, 50]], [[78, 10], [50, 50], [50, 90]]],
    Z: [[[22, 10], [78, 10], [22, 90], [78, 90]]],
  };

  if (typeof module === 'object' && module.exports) module.exports = S;
  else (root.AA = root.AA || {}).strokes = S;
})(typeof self !== 'undefined' ? self : globalThis);
