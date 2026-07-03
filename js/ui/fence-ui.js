// Fence section (Build tab). Length-based — doesn't use the Area shapes.

import { el } from './dom.js';
import { FENCE_STYLES, getPrices } from '../engine/constants.js';
import { calcFenceMaterials } from '../engine/fence-calc.js';
import { makeControls, previewCard } from './controls.js';

export function renderFenceSection(root, ctx) {
  const f = ctx.project.fence;

  const preview = previewCard(ctx, () => calcFenceMaterials({
    options: f,
    prices: getPrices(ctx.settings.prices),
  }), 'Enter the total fence length to see quantities.');

  const { numInput, select, selectRerender } = makeControls(ctx, preview.update);

  const card = el('div', { class: 'card' },
    el('h2', {}, 'Fence options'),
    el('div', { class: 'field' },
      el('label', {}, 'Total fence length (ft)'),
      numInput(f.lengthFt, v => f.lengthFt = v, { placeholder: 'Add up all the runs' }),
      el('div', { class: 'hint' }, 'Walk the line with a tape or measuring wheel; include every side that gets fence.')),
    el('div', { class: 'field' },
      el('label', {}, 'Style'),
      selectRerender(f.style, v => f.style = v,
        Object.entries(FENCE_STYLES).map(([key, s]) => [key, s.label]))),
    el('div', { class: 'field' },
      el('label', {}, 'Post spacing'),
      select(f.spacingFt, v => f.spacingFt = v, [
        [6, '6 ft'],
        [8, '8 ft — standard'],
        [10, '10 ft — split rail only'],
      ], parseFloat)),
    el('div', { class: 'field' },
      el('label', {}, 'Number of gates'),
      numInput(f.gates, v => f.gates = v ?? 0, { step: '1' }),
      el('div', { class: 'hint' }, 'Figured as 4 ft openings with their own posts and hardware.')));

  if (f.style === 'picket') {
    card.append(el('div', { class: 'field' },
      el('label', {}, 'Rails per section'),
      select(f.railsPerSection, v => f.railsPerSection = v, [
        [2, '2 — fences up to 4 ft tall'],
        [3, '3 — fences 5–6 ft tall'],
      ], parseFloat)));
  }

  root.append(card, preview.card);
}
