// Area tab: build the project area from shapes that add or subtract.

import { el } from './dom.js';
import { shapeArea, summarizeShapes } from '../engine/geometry.js';
import { fmtSqFt } from '../format.js';
import { makeId } from '../storage.js';
import { renderProjectsBar } from './projects-ui.js';

const KINDS = {
  rect:     { label: 'Rectangle', fields: [['widthFt', 'Width'], ['lengthFt', 'Length']] },
  circle:   { label: 'Circle',    fields: [['diameterFt', 'Diameter']] },
  triangle: { label: 'Triangle',  fields: [['baseFt', 'Base'], ['heightFt', 'Height']] },
};

// Two paired inputs (ft + in) editing one decimal-feet value.
function dimField(labelText, valueFt, onInput) {
  const v = (isFinite(valueFt) && valueFt > 0) ? valueFt : 0;
  const ftPart = Math.floor(v);
  const inPart = Math.round((v - ftPart) * 12 * 4) / 4;

  const ftIn = el('input', { type: 'number', inputmode: 'decimal', min: '0', step: 'any', value: ftPart || '' });
  const inIn = el('input', { type: 'number', inputmode: 'decimal', min: '0', max: '11.99', step: 'any', value: inPart || '' });
  const handler = () => onInput((parseFloat(ftIn.value) || 0) + (parseFloat(inIn.value) || 0) / 12);
  ftIn.addEventListener('input', handler);
  inIn.addEventListener('input', handler);

  return el('div', { class: 'field dim-field' },
    el('label', {}, labelText),
    el('div', { class: 'pair' },
      el('span', {}, ftIn, el('span', { class: 'unit' }, 'ft')),
      el('span', {}, inIn, el('span', { class: 'unit' }, 'in'))));
}

function shapeCard(shape, ctx, refresh) {
  const meta = KINDS[shape.kind];
  const areaEl = el('div', { class: 'shape-area' + (shape.mode === 'subtract' ? ' cutout' : '') });

  const updateArea = () => {
    const a = shapeArea(shape);
    areaEl.textContent = (shape.mode === 'subtract' ? '− ' : '') + fmtSqFt(a) + ' sq ft';
  };

  const segBtn = (mode, text) => el('button', {
    class: shape.mode === mode ? 'active' : '',
    onclick: () => { shape.mode = mode; ctx.save(); ctx.rerender(); },
  }, text);

  const card = el('div', { class: 'card shape-card' },
    el('div', { class: 'shape-head' },
      el('span', { class: 'shape-kind' }, meta.label),
      el('button', {
        class: 'shape-del',
        onclick: () => {
          ctx.project.shapes = ctx.project.shapes.filter(s => s.id !== shape.id);
          ctx.save();
          ctx.rerender();
        },
      }, 'Remove')),
    el('div', { class: 'field' },
      el('input', {
        type: 'text',
        placeholder: 'Label (e.g., Main patio, Shed cutout)',
        value: shape.label || '',
        oninput: (e) => { shape.label = e.target.value; ctx.save(); },
      })),
    el('div', { class: 'field' },
      el('div', { class: 'seg' },
        segBtn('add', 'Add area'),
        segBtn('subtract', 'Cutout (subtract)'))),
    meta.fields.map(([key, label]) =>
      dimField(label, shape.dims[key], (val) => {
        shape.dims[key] = val;
        ctx.save();
        updateArea();
        refresh();
      })),
    areaEl,
  );

  updateArea();
  return card;
}

export function renderAreaTab(root, ctx) {
  root.innerHTML = '';
  renderProjectsBar(root, ctx);

  const p = ctx.project;
  const summaryEl = el('div', { class: 'card' });

  const refreshSummary = () => {
    const sum = summarizeShapes(p.shapes);
    summaryEl.innerHTML = '';
    summaryEl.append(el('div', {},
      el('h2', {}, 'Net area: ' + fmtSqFt(sum.netSqFt) + ' sq ft'),
      sum.cutSqFt > 0
        ? el('div', { class: 'muted' }, `${fmtSqFt(sum.addSqFt)} sq ft added − ${fmtSqFt(sum.cutSqFt)} sq ft cutouts`)
        : null,
      sum.warnings.map(w => el('div', { class: 'warn', style: 'margin:8px 0 0' }, w)),
    ));
    ctx.updateChip();
  };

  root.append(summaryEl);

  for (const s of p.shapes) {
    root.append(shapeCard(s, ctx, refreshSummary));
  }

  if (!p.shapes.length) {
    root.append(el('div', { class: 'empty' },
      el('div', { class: 'big' }, '📐'),
      el('div', {}, 'Add your first shape below.'),
      el('div', { class: 'small', style: 'margin-top:6px' },
        'Break the project area into rectangles, circles, and triangles, then add cutouts for anything staying put (shed, tree ring).')));
  }

  const addShape = (kind) => {
    p.shapes.push({ id: makeId(), kind, mode: 'add', label: '', dims: {} });
    ctx.save();
    ctx.rerender();
  };

  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Add a shape'),
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn', onclick: () => addShape('rect') }, '▭ Rectangle'),
      el('button', { class: 'btn', onclick: () => addShape('circle') }, '◯ Circle'),
      el('button', { class: 'btn', onclick: () => addShape('triangle') }, '△ Triangle')),
    el('div', { class: 'hint', style: 'margin-top:8px' },
      'Triangles are measured as base × height (right-triangle corners). Measure to the nearest inch — close is good enough for materials.')));

  refreshSummary();
}
