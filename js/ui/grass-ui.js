// Grass tab: seed vs sod, grass type, topsoil, seed cover.

import { el } from './dom.js';
import { GRASS_TYPES, getPrices } from '../engine/constants.js';
import { calcGrassMaterials } from '../engine/grass-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { fmtSqFt, fmtQty } from '../format.js';

export function renderGrassTab(root, ctx) {
  root.innerHTML = '';
  const gr = ctx.project.grass;
  const sum = summarizeShapes(ctx.project.shapes);

  // --- enable toggle ---
  root.append(el('div', { class: 'card' },
    el('div', { class: 'switch-row' },
      el('span', { class: 'lab' }, 'This project includes grass'),
      el('label', { class: 'switch' },
        el('input', {
          type: 'checkbox',
          checked: gr.enabled,
          onchange: (e) => { gr.enabled = e.target.checked; ctx.save(); ctx.rerender(); },
        }),
        el('span', { class: 'knob' })))));

  if (!gr.enabled) {
    root.append(el('div', { class: 'empty' },
      el('div', { class: 'big' }, '🌱'),
      el('div', {}, 'Grass is off for this project.')));
    return;
  }

  const preview = el('div', { class: 'card' });
  const updatePreview = () => {
    const res = calcGrassMaterials({
      areaSqFt: sum.netSqFt,
      options: gr,
      prices: getPrices(ctx.settings.prices),
    });
    preview.innerHTML = '';
    preview.append(el('h2', {}, 'Quick preview'));
    if (!res.lines.length) {
      preview.append(el('div', { class: 'muted' }, 'Add shapes in the Area tab to see quantities.'));
    } else {
      const top = res.lines.slice(0, 3).map(l => `${fmtQty(l.qty)} ${l.unit} — ${l.label}`);
      preview.append(
        el('div', { class: 'muted' }, `${fmtSqFt(sum.netSqFt)} sq ft of new lawn:`),
        el('ul', { style: 'margin:6px 0 10px; padding-left:20px' }, top.map(t => el('li', {}, t))),
        el('button', { class: 'btn primary wide', onclick: () => ctx.switchTab('list') }, 'See full materials list'));
    }
  };

  const select = (value, onVal, options, parse = (x) => x) => el('select', {
    onchange: (e) => { onVal(parse(e.target.value)); ctx.save(); updatePreview(); },
  }, options.map(([v, label]) => el('option', { value: v, selected: String(value) === String(v) }, label)));

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

  root.append(preview);
  updatePreview();
}
