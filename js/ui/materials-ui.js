// List tab: the store-ready materials list — quantities, costs, store links,
// tools checklist, and copy/share as text.

import { el } from './dom.js';
import { getPrices, GRASS_TYPES } from '../engine/constants.js';
import { calcPaverMaterials } from '../engine/paver-calc.js';
import { calcGrassMaterials } from '../engine/grass-calc.js';
import { summarizeShapes } from '../engine/geometry.js';
import { storeLinks } from '../links.js';
import { fmtMoney, fmtQty, fmtSqFt } from '../format.js';

function matLine(l, ctx) {
  const links = storeLinks(l.searchQuery, ctx.settings).map(s =>
    el('a', { class: 'pill', href: s.url, target: '_blank', rel: 'noopener' }, s.short));

  return el('div', { class: 'mat-line' },
    el('div', { class: 'mat-qty' }, fmtQty(l.qty), el('span', { class: 'unit' }, l.unit)),
    el('div', { class: 'mat-label' }, l.label),
    el('div', { class: 'mat-price' }, fmtMoney(l.lineTotal)),
    el('div', { class: 'mat-detail' }, l.detail),
    el('div', { class: 'mat-links' },
      links,
      el('span', { class: 'unit-price' }, `${fmtMoney(l.unitPrice)} each`)));
}

function buildShareText(project, sum, sections, grandTotal) {
  const out = [];
  out.push(`${project.name || 'Yard project'} — materials list`);
  out.push(`Area: ${fmtSqFt(sum.netSqFt)} sq ft`);
  for (const sec of sections) {
    out.push('', sec.title.toUpperCase());
    for (const l of sec.lines) {
      out.push(`[ ] ${fmtQty(l.qty)} ${l.unit} — ${l.label} — ${fmtMoney(l.lineTotal)}`);
    }
  }
  out.push('', `ESTIMATED TOTAL: ${fmtMoney(grandTotal)}`);
  out.push('(prices are estimates — check the store for live prices)');
  return out.join('\n');
}

export function renderListTab(root, ctx) {
  root.innerHTML = '';
  const p = ctx.project;
  const sum = summarizeShapes(p.shapes);
  const prices = getPrices(ctx.settings.prices);

  sum.warnings.forEach(w => root.append(el('div', { class: 'warn' }, w)));

  if (sum.netSqFt <= 0) {
    root.append(el('div', { class: 'empty' },
      el('div', { class: 'big' }, '🧾'),
      el('div', {}, 'Nothing to calculate yet.'),
      el('div', { class: 'small', style: 'margin:8px 0 16px' }, 'Add the project area first — then your full materials list shows up here.'),
      el('button', { class: 'btn primary', onclick: () => ctx.switchTab('area') }, 'Go to Area')));
    return;
  }

  const sections = [];
  let tools = [];
  let notes = [];
  const warnings = [];

  if (p.paver.enabled) {
    const res = calcPaverMaterials({ areaSqFt: sum.netSqFt, perimeterFt: sum.perimeterFt, options: p.paver, prices });
    sections.push({ title: 'Pavers', lines: res.lines });
    tools = tools.concat(res.tools.map(t => ({ group: 'Paver work', t })));
    warnings.push(...res.warnings);
  }
  if (p.grass.enabled) {
    const res = calcGrassMaterials({ areaSqFt: sum.netSqFt, options: p.grass, prices });
    const method = p.grass.mode === 'sod' ? 'sod' : `${(GRASS_TYPES[p.grass.grassType] || GRASS_TYPES.sun_shade_mix).label} seed`;
    sections.push({ title: `Grass (${method})`, lines: res.lines });
    tools = tools.concat(res.tools.map(t => ({ group: 'Grass work', t })));
    notes = res.notes;
    warnings.push(...res.warnings);
  }

  warnings.forEach(w => root.append(el('div', { class: 'warn' }, w)));

  if (!sections.length) {
    root.append(el('div', { class: 'empty' },
      el('div', { class: 'big' }, '🧾'),
      el('div', {}, 'Pavers and grass are both switched off for this project.'),
      el('div', { class: 'small', style: 'margin-top:6px' }, 'Turn one on in its tab to get a materials list.')));
    return;
  }

  root.append(el('div', { class: 'muted', style: 'margin:2px 4px 10px' },
    `${p.name || 'Project'} · ${fmtSqFt(sum.netSqFt)} sq ft`));

  let grandTotal = 0;
  for (const sec of sections) {
    const card = el('div', { class: 'card' }, el('h2', {}, sec.title));
    if (!sec.lines.length) card.append(el('div', { class: 'muted' }, 'Nothing needed.'));
    sec.lines.forEach(l => { grandTotal += l.lineTotal; card.append(matLine(l, ctx)); });
    root.append(card);
  }

  // --- total + share ---
  const shareBtn = el('button', {
    class: 'btn primary wide',
    onclick: async () => {
      const text = buildShareText(p, sum, sections, grandTotal);
      try {
        if (navigator.share) {
          await navigator.share({ title: p.name || 'Materials list', text });
          return;
        }
        await navigator.clipboard.writeText(text);
        shareBtn.textContent = 'Copied ✓';
        setTimeout(() => { shareBtn.textContent = 'Copy / share list'; }, 1500);
      } catch (err) {
        if (err?.name === 'AbortError') return; // user closed the share sheet
        try {
          await navigator.clipboard.writeText(text);
          shareBtn.textContent = 'Copied ✓';
          setTimeout(() => { shareBtn.textContent = 'Copy / share list'; }, 1500);
        } catch { alert(text); }
      }
    },
  }, 'Copy / share list');

  root.append(el('div', { class: 'card' },
    el('div', { class: 'grand-total' },
      el('span', {}, 'Estimated total'),
      el('span', {}, fmtMoney(grandTotal))),
    el('div', { class: 'hint', style: 'margin:4px 0 12px' },
      'Estimates from your saved prices — tap the store buttons on any line for live prices. Bulk gravel/topsoil delivery is often far cheaper than bags.'),
    shareBtn));

  // --- tools checklist ---
  if (tools.length) {
    const toolCard = el('div', { class: 'card' }, el('h2', {}, 'Tools & rentals'));
    let lastGroup = null;
    for (const { group, t } of tools) {
      if (group !== lastGroup) {
        toolCard.append(el('h3', {}, group));
        lastGroup = group;
      }
      const checked = !!p.toolsChecked[t];
      const rowEl = el('label', { class: 'tool-row' + (checked ? ' checked' : '') },
        el('input', {
          type: 'checkbox',
          checked,
          onchange: (e) => {
            p.toolsChecked[t] = e.target.checked;
            ctx.save();
            rowEl.classList.toggle('checked', e.target.checked);
          },
        }),
        el('span', {}, t));
      toolCard.append(rowEl);
    }
    root.append(toolCard);
  }

  if (notes.length) {
    root.append(el('div', { class: 'card' },
      el('h2', {}, 'Good to know'),
      notes.map(n => el('div', { class: 'muted', style: 'margin-bottom:6px' }, '• ' + n))));
  }
}
