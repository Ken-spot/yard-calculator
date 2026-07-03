// Sprinklers section (Build tab): four system types.

import { el } from './dom.js';
import { SPRINKLER_TYPES, getPrices } from '../engine/constants.js';
import { calcSprinklerMaterials } from '../engine/sprinkler-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { makeControls, previewCard } from './controls.js';

export function renderSprinklerSection(root, ctx) {
  const s = ctx.project.sprinkler;
  const sum = summarizeShapes(ctx.project.shapes);

  const preview = previewCard(ctx, () => calcSprinklerMaterials({
    areaSqFt: sum.netSqFt,
    options: s,
    prices: getPrices(ctx.settings.prices),
  }), 'Add the watering-area shapes in the Area tab to see quantities.');

  const { numInput, selectRerender } = makeControls(ctx, preview.update);

  const card = el('div', { class: 'card' },
    el('h2', {}, 'Sprinkler system'),
    el('div', { class: 'field' },
      el('label', {}, 'System type'),
      selectRerender(s.type, v => s.type = v,
        Object.entries(SPRINKLER_TYPES).map(([key, t]) => [key, t.label])),
      el('div', { class: 'hint' },
        'In-ground systems water automatically but mean trenching. Hose-end is the easy option for getting new grass established.')));

  if (s.type === 'rotor' || s.type === 'spray') {
    card.append(el('div', { class: 'field' },
      el('label', {}, 'Your water supply (GPM)'),
      numInput(s.supplyGpm, v => s.supplyGpm = v ?? 12),
      el('div', { class: 'hint' },
        'Measure it: time filling a 5-gallon bucket from the outdoor spigot — GPM = 300 ÷ seconds. Typical homes: 10–13.')));
  } else if (s.type === 'drip') {
    card.append(el('div', { class: 'hint' },
      'Drip is for beds and borders (not lawns) — figured as inline-emitter tubing snaked through the bed about every 12 in.'));
  }

  root.append(card, preview.card);
}
