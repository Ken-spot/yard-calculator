// List tab: the store-ready materials list — quantities, costs, store links,
// tools checklist, and copy/share as text. Aggregates every enabled calculator.

import { el } from './dom.js';
import { getPrices, GRASS_TYPES } from '../engine/constants.js';
import { calcPaverMaterials } from '../engine/paver-calc.js';
import { calcGrassMaterials } from '../engine/grass-calc.js';
import { calcMulchMaterials } from '../engine/mulch-calc.js';
import { calcGravelMaterials } from '../engine/gravel-calc.js';
import { calcConcreteMaterials } from '../engine/concrete-calc.js';
import { calcFenceMaterials } from '../engine/fence-calc.js';
import { calcPlantsMaterials } from '../engine/plants-calc.js';
import { calcSprinklerMaterials } from '../engine/sprinkler-calc.js';
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

// Run every enabled calculator and return its sections.
function collectSections(p, sum, prices) {
  const sections = [];
  const add = (title, res) => sections.push({ title, ...res });

  if (p.paver.enabled) {
    add('Pavers', calcPaverMaterials({ areaSqFt: sum.netSqFt, perimeterFt: sum.perimeterFt, options: p.paver, prices }));
  }
  if (p.grass.enabled) {
    const method = p.grass.mode === 'sod' ? 'sod' : `${(GRASS_TYPES[p.grass.grassType] || GRASS_TYPES.sun_shade_mix).label} seed`;
    add(`Grass (${method})`, calcGrassMaterials({ areaSqFt: sum.netSqFt, options: p.grass, prices }));
  }
  if (p.mulch.enabled) {
    add('Mulch', calcMulchMaterials({ areaSqFt: sum.netSqFt, options: p.mulch, prices }));
  }
  if (p.gravel.enabled) {
    add('Gravel & rock', calcGravelMaterials({ areaSqFt: sum.netSqFt, options: p.gravel, prices }));
  }
  if (p.concrete.enabled) {
    add('Concrete slab', calcConcreteMaterials({ areaSqFt: sum.netSqFt, perimeterFt: sum.perimeterFt, options: p.concrete, prices }));
  }
  if (p.fence.enabled) {
    add('Fence', calcFenceMaterials({ options: p.fence, prices }));
  }
  if (p.plants.enabled) {
    add('Trees & bushes', calcPlantsMaterials({ areaSqFt: sum.netSqFt, options: p.plants, prices }));
  }
  if (p.sprinkler.enabled) {
    add('Sprinklers', calcSprinklerMaterials({ areaSqFt: sum.netSqFt, options: p.sprinkler, prices }));
  }
  return sections;
}

function buildShareText(project, sum, sections, grandTotal) {
  const out = [];
  out.push(`${project.name || 'Yard project'} — materials list`);
  if (sum.netSqFt > 0) out.push(`Area: ${fmtSqFt(sum.netSqFt)} sq ft`);
  for (const sec of sections) {
    if (!sec.lines.length) continue;
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

  const sections = collectSections(p, sum, prices);
  const totalLines = sections.reduce((n, s) => n + s.lines.length, 0);

  if (!sections.length || totalLines === 0) {
    const noneEnabled = !sections.length;
    root.append(el('div', { class: 'empty' },
      el('div', { class: 'big' }, '🧾'),
      el('div', {}, noneEnabled
        ? 'Nothing switched on yet.'
        : 'Almost there — the calculators need their inputs.'),
      el('div', { class: 'small', style: 'margin:8px 0 16px' }, noneEnabled
        ? 'Turn on the calculators this project needs in the Build tab.'
        : 'Most calculators use the shapes from the Area tab; fence and hedge rows have their own length fields in Build.'),
      el('button', {
        class: 'btn primary',
        onclick: () => ctx.switchTab(noneEnabled ? 'build' : 'area'),
      }, noneEnabled ? 'Go to Build' : 'Go to Area')));
    // still surface warnings from enabled calcs (e.g., fence gates > length)
    sections.forEach(sec => (sec.warnings || []).forEach(w => root.append(el('div', { class: 'warn' }, w))));
    return;
  }

  root.append(el('div', { class: 'muted', style: 'margin:2px 4px 10px' },
    `${p.name || 'Project'}${sum.netSqFt > 0 ? ` · ${fmtSqFt(sum.netSqFt)} sq ft` : ''}`));

  let grandTotal = 0;
  for (const sec of sections) {
    (sec.warnings || []).forEach(w => root.append(el('div', { class: 'warn' }, w)));
    if (!sec.lines.length) continue;
    const card = el('div', { class: 'card' }, el('h2', {}, sec.title));
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
      'Estimates from your saved prices — tap the store buttons on any line for live prices. Bulk gravel/topsoil/mulch delivery is often far cheaper than bags.'),
    shareBtn));

  // --- tools checklist (grouped per calculator) ---
  const toolGroups = sections.filter(s => s.lines.length && s.tools?.length);
  if (toolGroups.length) {
    const toolCard = el('div', { class: 'card' }, el('h2', {}, 'Tools & rentals'));
    for (const sec of toolGroups) {
      toolCard.append(el('h3', {}, sec.title));
      for (const t of sec.tools) {
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
    }
    root.append(toolCard);
  }

  // --- notes (deduped across calculators) ---
  const notes = [...new Set(sections.flatMap(s => (s.lines.length && s.notes) || []))];
  if (notes.length) {
    root.append(el('div', { class: 'card' },
      el('h2', {}, 'Good to know'),
      notes.map(n => el('div', { class: 'muted', style: 'margin-bottom:6px' }, '• ' + n))));
  }
}
