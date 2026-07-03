// Grass section (Build tab): seed vs sod, grass type, topsoil, seed cover.

import { el } from './dom.js';
import { GRASS_TYPES, getPrices } from '../engine/constants.js';
import { calcGrassMaterials } from '../engine/grass-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { makeControls, previewCard } from './controls.js';

export function renderGrassSection(root, ctx) {
  const gr = ctx.project.grass;
  const sum = summarizeShapes(ctx.project.shapes);

  const preview = previewCard(ctx, () => calcGrassMaterials({
    areaSqFt: sum.netSqFt,
    options: gr,
    prices: getPrices(ctx.settings.prices),
  }), 'Add shapes in the Area tab to see quantities.');

  const { select } = makeControls(ctx, preview.update);

  // --- seed vs sod ---
  const segBtn = (mode, text) => el('button', {
    class: gr.mode === mode ? 'active' : '',
    onclick: () => { gr.mode = mode; ctx.save(); ctx.rerender(); },
  }, text);

  const methodCard = el('div', { class: 'card' },
    el('h2', {}, 'Method'),
    el('div', { class: 'field' },
      el('div', { class: 'seg' },
        segBtn('seed', 'Seed'),
        segBtn('sod', 'Sod'))),
  );

  if (gr.mode === 'seed') {
    methodCard.append(
      el('div', { class: 'field' },
        el('label', {}, 'Grass type'),
        select(gr.grassType, v => gr.grassType = v,
          Object.entries(GRASS_TYPES).map(([key, t]) =>
            [key, `${t.label} (${t.ratePer1000} lb / 1,000 sq ft)`]))),
      el('div', { class: 'field' },
        el('label', {}, 'Seed cover'),
        select(gr.seedCover, v => gr.seedCover = v, [
          ['straw', 'Straw — cheap, standard'],
          ['peat', 'Peat moss — tidier, holds moisture'],
          ['none', 'None'],
        ]),
        el('div', { class: 'hint' }, 'A light cover keeps seed moist and hides it from birds.')));
  } else {
    methodCard.append(el('div', { class: 'hint' },
      'Sod is priced by the pallet (~450 sq ft) or by the 2×5 ft roll. Order fresh-cut for the day you install.'));
  }
  root.append(methodCard);

  // --- soil prep ---
  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Soil prep'),
    el('div', { class: 'field' },
      el('label', {}, 'New topsoil depth'),
      select(gr.topsoilDepthIn, v => gr.topsoilDepthIn = v, [
        [0, 'None — my soil is good'],
        [2, '2 in'],
        [3, '3 in — typical for new lawns'],
        [4, '4 in — poor or rocky soil'],
      ], parseFloat))));

  root.append(preview.card);
}
