// Pavers tab: paver size, base depths, waste, edging.

import { el } from './dom.js';
import { PAVER_PRESETS, getPrices } from '../engine/constants.js';
import { calcPaverMaterials } from '../engine/paver-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { fmtSqFt, fmtQty } from '../format.js';

export function renderPaverTab(root, ctx) {
  root.innerHTML = '';
  const pv = ctx.project.paver;
  const sum = summarizeShapes(ctx.project.shapes);

  // --- enable toggle ---
  root.append(el('div', { class: 'card' },
    el('div', { class: 'switch-row' },
      el('span', { class: 'lab' }, 'This project includes pavers'),
      el('label', { class: 'switch' },
        el('input', {
          type: 'checkbox',
          checked: pv.enabled,
          onchange: (e) => { pv.enabled = e.target.checked; ctx.save(); ctx.rerender(); },
        }),
        el('span', { class: 'knob' })))));

  if (!pv.enabled) {
    root.append(el('div', { class: 'empty' },
      el('div', { class: 'big' }, '🧱'),
      el('div', {}, 'Pavers are off for this project.')));
    return;
  }

  const preview = el('div', { class: 'card' });
  const updatePreview = () => {
    const res = calcPaverMaterials({
      areaSqFt: sum.netSqFt,
      perimeterFt: sum.perimeterFt,
      options: pv,
      prices: getPrices(ctx.settings.prices),
    });
    preview.innerHTML = '';
    preview.append(el('h2', {}, 'Quick preview'));
    if (!res.lines.length) {
      preview.append(el('div', { class: 'muted' }, 'Add shapes in the Area tab to see quantities.'));
    } else {
      const top = res.lines.slice(0, 3)
        .map(l => `${fmtQty(l.qty)} ${l.unit} — ${l.label}`);
      preview.append(
        el('div', { class: 'muted' }, `${fmtSqFt(sum.netSqFt)} sq ft of pavers:`),
        el('ul', { style: 'margin:6px 0 10px; padding-left:20px' }, top.map(t => el('li', {}, t))),
        el('button', { class: 'btn primary wide', onclick: () => ctx.switchTab('list') }, 'See full materials list'));
    }
    res.warnings.forEach(w => preview.append(el('div', { class: 'warn', style: 'margin:8px 0 0' }, w)));
  };

  // number input helper: live update, no re-render (keeps keyboard focus)
  const numInput = (value, onVal, attrs = {}) => el('input', {
    type: 'number', inputmode: 'decimal', min: '0', step: 'any',
    value: (value ?? '') === 0 ? '0' : (value ?? ''),
    oninput: (e) => {
      const v = parseFloat(e.target.value);
      onVal(isFinite(v) ? v : null);
      ctx.save();
      updatePreview();
    },
    ...attrs,
  });

  // --- paver size ---
  const sizeCard = el('div', { class: 'card' }, el('h2', {}, 'Paver size'));
  const presetSelect = el('select', {
    onchange: (e) => { pv.preset = e.target.value; ctx.save(); ctx.rerender(); },
  },
    Object.entries(PAVER_PRESETS).map(([key, p]) =>
      el('option', { value: key, selected: pv.preset === key }, p.label)),
    el('option', { value: 'custom', selected: pv.preset === 'custom' }, 'Custom size…'));
  sizeCard.append(el('div', { class: 'field' }, presetSelect));

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
  const depthSelect = (value, onVal, options) => el('select', {
    onchange: (e) => { onVal(parseFloat(e.target.value)); ctx.save(); updatePreview(); },
  }, options.map(([v, label]) => el('option', { value: v, selected: value === v }, label)));

  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Base layers'),
    el('div', { class: 'field' },
      el('label', {}, 'Gravel base depth'),
      depthSelect(pv.gravelDepthIn, v => pv.gravelDepthIn = v, [
        [4, '4 in — patios & walkways'],
        [6, '6 in — heavy use / soft soil'],
        [8, '8 in — driveways'],
      ])),
    el('div', { class: 'field' },
      el('label', {}, 'Bedding sand depth'),
      depthSelect(pv.sandDepthIn, v => pv.sandDepthIn = v, [
        [0.5, '½ in'],
        [1, '1 in — standard'],
        [1.5, '1½ in'],
      ])),
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

  root.append(preview);
  updatePreview();
}
