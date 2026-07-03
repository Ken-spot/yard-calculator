// Mulch section (Build tab).

import { el } from './dom.js';
import { MULCH_TYPES, getPrices } from '../engine/constants.js';
import { calcMulchMaterials } from '../engine/mulch-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { makeControls, previewCard } from './controls.js';

export function renderMulchSection(root, ctx) {
  const m = ctx.project.mulch;
  const sum = summarizeShapes(ctx.project.shapes);

  const preview = previewCard(ctx, () => calcMulchMaterials({
    areaSqFt: sum.netSqFt,
    options: m,
    prices: getPrices(ctx.settings.prices),
  }), 'Add the bed shapes in the Area tab to see quantities.');

  const { select, switchRow } = makeControls(ctx, preview.update);

  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Mulch options'),
    el('div', { class: 'field' },
      el('label', {}, 'Mulch type'),
      select(m.type, v => m.type = v,
        Object.entries(MULCH_TYPES).map(([key, t]) => [key, t.label]))),
    el('div', { class: 'field' },
      el('label', {}, 'Depth'),
      select(m.depthIn, v => m.depthIn = v, [
        [2, '2 in — refreshing an existing bed'],
        [3, '3 in — standard new bed'],
        [4, '4 in — maximum weed suppression'],
      ], parseFloat)),
    switchRow('Landscape fabric under the mulch', m.fabric, v => m.fabric = v),
    el('div', { class: 'hint' }, 'Skip fabric around plants you want to spread; use it under paths and rock.')));

  root.append(preview.card);
}
