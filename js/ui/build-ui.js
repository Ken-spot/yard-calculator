// Build tab: one toggle card per calculator; enabled calculators expand
// their option cards below the toggle.

import { el } from './dom.js';
import { renderPaverSection } from './paver-ui.js';
import { renderGrassSection } from './grass-ui.js';
import { renderMulchSection } from './mulch-ui.js';
import { renderGravelSection } from './gravel-ui.js';
import { renderConcreteSection } from './concrete-ui.js';
import { renderFenceSection } from './fence-ui.js';
import { renderPlantsSection } from './plants-ui.js';
import { renderSprinklerSection } from './sprinkler-ui.js';

const CALCS = [
  { key: 'paver',     icon: '🧱', label: 'Pavers',        render: renderPaverSection },
  { key: 'grass',     icon: '🌱', label: 'Grass',         render: renderGrassSection },
  { key: 'mulch',     icon: '🍂', label: 'Mulch',         render: renderMulchSection },
  { key: 'gravel',    icon: '🪨', label: 'Gravel & rock', render: renderGravelSection },
  { key: 'concrete',  icon: '🏗️', label: 'Concrete slab', render: renderConcreteSection },
  { key: 'fence',     icon: '🚧', label: 'Fence',         render: renderFenceSection },
  { key: 'plants',    icon: '🌳', label: 'Trees & bushes', render: renderPlantsSection },
  { key: 'sprinkler', icon: '💧', label: 'Sprinklers',    render: renderSprinklerSection },
];

export function renderBuildTab(root, ctx) {
  root.innerHTML = '';
  const p = ctx.project;
  const anyOn = CALCS.some(c => p[c.key].enabled);

  root.append(el('div', { class: 'muted', style: 'margin:2px 4px 10px' },
    anyOn
      ? 'Switch on everything this project needs.'
      : 'What are you building? Switch on the calculators this project needs.'));

  for (const calc of CALCS) {
    const opts = p[calc.key];

    root.append(el('div', { class: 'card' },
      el('div', { class: 'switch-row' },
        el('span', { class: 'lab' }, `${calc.icon} ${calc.label}`),
        el('label', { class: 'switch' },
          el('input', {
            type: 'checkbox',
            checked: opts.enabled,
            onchange: (e) => { opts.enabled = e.target.checked; ctx.save(); ctx.rerender(); },
          }),
          el('span', { class: 'knob' })))));

    if (opts.enabled) {
      const section = el('div', { class: 'calc-section' });
      calc.render(section, ctx);
      root.append(section);
    }
  }
}
