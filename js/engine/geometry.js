// Composite-area geometry. Pure functions — no DOM, no storage.
// Shapes: { kind: 'rect'|'circle'|'triangle', mode: 'add'|'subtract', dims: {...} }
// All dimensions are decimal feet.

import { HUGE_AREA_SQFT } from './constants.js';

function num(v) {
  return (typeof v === 'number' && isFinite(v) && v > 0) ? v : 0;
}

// Square feet for one shape; 0 if any dimension is missing/invalid.
export function shapeArea(shape) {
  const d = shape?.dims || {};
  switch (shape?.kind) {
    case 'rect': {
      const w = num(d.widthFt), l = num(d.lengthFt);
      return w && l ? w * l : 0;
    }
    case 'circle': {
      const dia = num(d.diameterFt);
      return dia ? Math.PI * (dia / 2) ** 2 : 0;
    }
    case 'triangle': {
      const b = num(d.baseFt), h = num(d.heightFt);
      return b && h ? (b * h) / 2 : 0;
    }
    default:
      return 0;
  }
}

// Outside edge of one shape, in feet. Triangle assumes a right triangle
// (base + height + hypotenuse) — documented in the UI hint.
export function shapePerimeter(shape) {
  const d = shape?.dims || {};
  switch (shape?.kind) {
    case 'rect': {
      const w = num(d.widthFt), l = num(d.lengthFt);
      return w && l ? 2 * (w + l) : 0;
    }
    case 'circle': {
      const dia = num(d.diameterFt);
      return dia ? Math.PI * dia : 0;
    }
    case 'triangle': {
      const b = num(d.baseFt), h = num(d.heightFt);
      return b && h ? b + h + Math.hypot(b, h) : 0;
    }
    default:
      return 0;
  }
}

// Totals across a shape list.
// Perimeter sums 'add' shapes only — an estimate that's right when shapes
// don't touch each other; the paver UI offers a manual override.
export function summarizeShapes(shapes = []) {
  let addSqFt = 0, cutSqFt = 0, perimeterFt = 0;
  const warnings = [];

  for (const s of shapes) {
    const a = shapeArea(s);
    if (s.mode === 'subtract') {
      cutSqFt += a;
    } else {
      addSqFt += a;
      perimeterFt += shapePerimeter(s);
    }
  }

  let netSqFt = addSqFt - cutSqFt;
  if (netSqFt < 0) {
    warnings.push('Your cutouts are bigger than the total area — check the shape dimensions.');
    netSqFt = 0;
  }
  if (netSqFt > HUGE_AREA_SQFT) {
    warnings.push(`That's over ${HUGE_AREA_SQFT.toLocaleString()} sq ft — double-check for a typo in the dimensions.`);
  }

  return { netSqFt, addSqFt, cutSqFt, perimeterFt, warnings };
}
