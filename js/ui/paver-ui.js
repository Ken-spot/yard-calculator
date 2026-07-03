// Pavers section (Build tab): paver size, base depths, waste, edging.

import { el } from './dom.js';
import { PAVER_PRESETS, getPrices } from '../engine/constants.js';
import { calcPaverMaterials } from '../engine/paver-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { fmtSqFt } from '../format.js';
import { makeControls, previewCard } from './controls.js';

export function renderPaverSection(root, ctx) {
  const pv = ctx.project.paver;
  const sum = summarizeShapes(ctx.project.shapes);

  const preview = previewCard(ctx, () => calcPaverMaterials({
    areaSqFt: sum.netSqFt,
    perimeterFt: sum.perimeterFt,
    options: pv,
    prices: getPrices(ctx.settings.prices),
  }), 'Add shapes in the Area tab to see quantities.');

  const { numInput, select, selectRerender } = makeControls(ctx, preview.update);

  // --- paver size ---
  const sizeCard = el('div', { class: 'card' }, el('h2', {}, 'Paver size'),
    el('div', { class: 'field' },
      selectRerender(pv.preset, v => pv.preset = v, [
        ...Object.entries(PAVER_PRESETS).map(([key, p]) => [key, p.label]),
        ['custom', 'Custom size…'],
      ])));

  if (pv.preset === 'custom') {
    sizeCard.append(el('div', { class: 'row' },
      el('div', { class: 'field' },
        el('label', {}, 'Width (in)'),
        numInput(pv.customWIn, v => pv.customWIn = v)),
      el('div', { class: 'field' },
        el('label', {}, 'Length (in)'),
        numInput(pv.customLIn, v => pv.customLIn = v))));
  }
  root.append(sizeCard);

  // --- base & waste ---
  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Base layers'),
    el('div', { class: 'field' },
      el('label', {}, 'Gravel base depth'),
      select(pv.gravelDepthIn, v => pv.gravelDepthIn = v, [
        [4, '4 in — patios & walkways'],
        [6, '6 in — heavy use / soft soil'],
        [8, '8 in — driveways'],
      ], parseFloat)),
    el('div', { class: 'field' },
      el('label', {}, 'Bedding sand depth'),
      select(pv.sandDepthIn, v => pv.sandDepthIn = v, [
        [0.5, '½ in'],
        [1, '1 in — standard'],
        [1.5, '1½ in'],
      ], parseFloat)),
    el('div', { class: 'field' },
      el('label', {}, 'Extra for cuts & breakage (%)'),
      numInput(pv.wastePct, v => pv.wastePct = v ?? 10),
      el('div', { class: 'hint' }, '10% is typical. Use 15% for lots of curves or diagonal patterns.'))));

  // --- edging ---
  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Edging'),
    el('div', { class: 'muted', style: 'margin-bottom:10px' },
      `Estimated edge from your shapes: ~${fmtSqFt(sum.perimeterFt)} ft`),
    el('div', { class: 'field' },
      el('label', {}, 'Measured edge length (ft) — optional'),
      numInput(pv.edgingOverrideFt, v => pv.edgingOverrideFt = v, { placeholder: 'Leave blank to use the estimate' }),
      el('div', { class: 'hint' }, 'If shapes touch each other or a wall, the estimate runs high — measure the real outside edge and enter it here.')),
    el('div', { class: 'field' },
      el('label', {}, 'Edge that needs no edging (ft)'),
      numInput(pv.edgingExcludeFt, v => pv.edgingExcludeFt = v ?? 0),
      el('div', { class: 'hint' }, 'For example, the side that sits against the house or an existing wall.'))));

  root.append(preview.card);
}
