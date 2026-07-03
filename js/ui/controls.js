// Shared form controls and the "Quick preview" card used by every
// calculator section on the Build tab.

import { el } from './dom.js';
import { fmtQty } from '../format.js';

// Bundle of input builders wired to save + live-refresh (no full re-render,
// so number inputs keep keyboard focus while typing).
export function makeControls(ctx, onLiveChange) {
  const numInput = (value, onVal, attrs = {}) => el('input', {
    type: 'number', inputmode: 'decimal', min: '0', step: 'any',
    value: (value ?? '') === 0 ? '0' : (value ?? ''),
    oninput: (e) => {
      const v = parseFloat(e.target.value);
      onVal(isFinite(v) ? v : null);
      ctx.save();
      onLiveChange();
    },
    ...attrs,
  });

  const select = (value, onVal, options, parse = (x) => x) => el('select', {
    onchange: (e) => { onVal(parse(e.target.value)); ctx.save(); onLiveChange(); },
  }, options.map(([v, label]) => el('option', { value: v, selected: String(value) === String(v) }, label)));

  // Like select, but for choices that show/hide other fields (needs re-render)
  const selectRerender = (value, onVal, options, parse = (x) => x) => el('select', {
    onchange: (e) => { onVal(parse(e.target.value)); ctx.save(); ctx.rerender(); },
  }, options.map(([v, label]) => el('option', { value: v, selected: String(value) === String(v) }, label)));

  const switchRow = (labelText, checked, onVal) => el('div', { class: 'switch-row' },
    el('span', { class: 'lab' }, labelText),
    el('label', { class: 'switch' },
      el('input', {
        type: 'checkbox', checked,
        onchange: (e) => { onVal(e.target.checked); ctx.save(); onLiveChange(); },
      }),
      el('span', { class: 'knob' })));

  return { numInput, select, selectRerender, switchRow };
}

// Quick-preview card: shows the top material lines for one calculator.
// `compute` returns { lines, warnings } (an engine result); `emptyMsg`
// explains what's missing when there are no lines.
export function previewCard(ctx, compute, emptyMsg) {
  const card = el('div', { class: 'card' });
  const update = () => {
    const res = compute();
    card.innerHTML = '';
    card.append(el('h2', {}, 'Quick preview'));
    if (!res.lines.length) {
      card.append(el('div', { class: 'muted' }, emptyMsg));
    } else {
      card.append(
        el('ul', { style: 'margin:6px 0 10px; padding-left:20px' },
          res.lines.slice(0, 4).map(l => el('li', {}, `${fmtQty(l.qty)} ${l.unit} — ${l.label}`))),
        el('button', { class: 'btn primary wide', onclick: () => ctx.switchTab('list') }, 'See full materials list'));
    }
    (res.warnings || []).forEach(w => card.append(el('div', { class: 'warn', style: 'margin:8px 0 0' }, w)));
  };
  update();
  return { card, update };
}
