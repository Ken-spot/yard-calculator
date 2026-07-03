// Gravel section (Build tab): paths, pads, rock beds.

import { el } from './dom.js';
import { GRAVEL_TYPES, getPrices } from '../engine/constants.js';
import { calcGravelMaterials } from '../engine/gravel-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { makeControls, previewCard } from './controls.js';

export function renderGravelSection(root, ctx) {
  const g = ctx.project.gravel;
  const sum = summarizeShapes(ctx.project.shapes);

  const preview = previewCard(ctx, () => calcGravelMaterials({
    areaSqFt: sum.netSqFt,
    options: g,
    prices: getPrices(ctx.settings.prices),
  }), 'Add the path/pad shapes in the Area tab to see quantities.');

  const { select, switchRow } = makeControls(ctx, preview.update);

  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Gravel options'),
    el('div', { class: 'field' },
      el('label', {}, 'Gravel type'),
      select(g.type, v => g.type = v,
        Object.entries(GRAVEL_TYPES).map(([key, t]) => [key, t.label])),
      el('div', { class: 'hint' }, 'Crushed stone locks together — best for paths and parking. Pea gravel and river rock stay loose — best for beds and drainage.')),
    el('div', { class: 'field' },
      el('label', {}, 'Depth'),
      select(g.depthIn, v => g.depthIn = v, [
        [2, '2 in — decorative bed over fabric'],
        [3, '3 in — walking path'],
        [4, '4 in — heavy-use path / pad'],
        [6, '6 in — parking area'],
      ], parseFloat)),
    switchRow('Landscape fabric underneath', g.fabric, v => g.fabric = v)));

  root.append(preview.card);
}
