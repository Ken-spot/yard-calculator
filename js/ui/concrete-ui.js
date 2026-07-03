// Concrete slab section (Build tab).

import { el } from './dom.js';
import { getPrices } from '../engine/constants.js';
import { calcConcreteMaterials } from '../engine/concrete-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { makeControls, previewCard } from './controls.js';

export function renderConcreteSection(root, ctx) {
  const c = ctx.project.concrete;
  const sum = summarizeShapes(ctx.project.shapes);

  const preview = previewCard(ctx, () => calcConcreteMaterials({
    areaSqFt: sum.netSqFt,
    perimeterFt: sum.perimeterFt,
    options: c,
    prices: getPrices(ctx.settings.prices),
  }), 'Add the slab shape in the Area tab to see quantities.');

  const { select, switchRow } = makeControls(ctx, preview.update);

  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Slab options'),
    el('div', { class: 'field' },
      el('label', {}, 'Thickness'),
      select(c.thicknessIn, v => c.thicknessIn = v, [
        [4, '4 in — walkways, patios, shed pads'],
        [5, '5 in — light vehicle traffic'],
        [6, '6 in — driveways, heavy loads'],
      ], parseFloat)),
    switchRow('4 in gravel base underneath', c.base, v => c.base = v),
    switchRow('Wire remesh reinforcement', c.mesh, v => c.mesh = v),
    switchRow('Form boards (new forms)', c.forms, v => c.forms = v),
    el('div', { class: 'hint' },
      'Pouring against existing edges? Turn off forms. Small pad on solid packed ground? You can skip the base.')));

  root.append(preview.card);
}
