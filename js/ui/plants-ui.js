// Trees & bushes section (Build tab): spacing → plant count.

import { el } from './dom.js';
import { getPrices } from '../engine/constants.js';
import { calcPlantsMaterials } from '../engine/plants-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { makeControls, previewCard } from './controls.js';

export function renderPlantsSection(root, ctx) {
  const pl = ctx.project.plants;
  const sum = summarizeShapes(ctx.project.shapes);

  const preview = previewCard(ctx, () => calcPlantsMaterials({
    areaSqFt: sum.netSqFt,
    options: pl,
    prices: getPrices(ctx.settings.prices),
  }), pl.layout === 'grid'
    ? 'Add the planting-bed shapes in the Area tab to see the plant count.'
    : 'Enter the row length to see the plant count.');

  const { numInput, switchRow } = makeControls(ctx, preview.update);

  const segBtn = (layout, text) => el('button', {
    class: pl.layout === layout ? 'active' : '',
    onclick: () => { pl.layout = layout; ctx.save(); ctx.rerender(); },
  }, text);

  const card = el('div', { class: 'card' },
    el('h2', {}, 'Planting layout'),
    el('div', { class: 'field' },
      el('div', { class: 'seg' },
        segBtn('grid', 'Fill an area'),
        segBtn('row', 'Single row / hedge'))),
    el('div', { class: 'field' },
      el('label', {}, 'Spacing between plants (ft)'),
      numInput(pl.spacingFt, v => pl.spacingFt = v),
      el('div', { class: 'hint' },
        'Use the MATURE width off the plant tag. Typical: small shrubs 3 ft, big shrubs 5 ft, privacy trees (arborvitae) 3–4 ft, shade trees 20+ ft.')));

  if (pl.layout === 'row') {
    card.append(el('div', { class: 'field' },
      el('label', {}, 'Row length (ft)'),
      numInput(pl.rowLengthFt, v => pl.rowLengthFt = v)));
  } else {
    card.append(el('div', { class: 'hint' }, 'Uses the net area from the Area tab.'));
  }

  card.append(switchRow('Add garden soil per plant', pl.soilBags, v => pl.soilBags = v));

  root.append(card, preview.card);
}
