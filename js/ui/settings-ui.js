// Settings tab: editable prices, store options, data notes.

import { el } from './dom.js';
import { DEFAULT_PRICES } from '../engine/constants.js';
import { storageAvailable } from '../storage.js';

export const APP_VERSION = '1.1.0';

export function renderSettingsTab(root, ctx) {
  root.innerHTML = '';
  const s = ctx.settings;

  // --- prices ---
  const priceCard = el('div', { class: 'card' },
    el('h2', {}, 'My prices'),
    el('div', { class: 'hint', style: 'margin-bottom:8px' },
      'Used for the cost estimate. Update these after a store trip and every list gets more accurate.'));

  let lastGroup = null;
  for (const [key, def] of Object.entries(DEFAULT_PRICES)) {
    if (def.group !== lastGroup) {
      priceCard.append(el('h3', {}, def.group));
      lastGroup = def.group;
    }
    const current = (typeof s.prices[key] === 'number') ? s.prices[key] : def.price;
    priceCard.append(el('div', { class: 'price-row' },
      el('label', { for: 'price-' + key }, def.label),
      el('input', {
        id: 'price-' + key,
        type: 'number', inputmode: 'decimal', min: '0', step: '0.01',
        value: current,
        oninput: (e) => {
          const v = parseFloat(e.target.value);
          if (isFinite(v) && v >= 0 && v !== def.price) s.prices[key] = v;
          else delete s.prices[key];
          ctx.save();
        },
      })));
  }

  priceCard.append(el('button', {
    class: 'btn wide', style: 'margin-top:10px',
    onclick: () => {
      if (!confirm('Reset all prices to the built-in defaults?')) return;
      s.prices = {};
      ctx.save();
      ctx.rerender();
    },
  }, 'Reset prices to defaults'));
  root.append(priceCard);

  // --- stores ---
  root.append(el('div', { class: 'card' },
    el('h2', {}, 'Stores'),
    el('div', { class: 'switch-row' },
      el('span', { class: 'lab' }, 'Show Menards links'),
      el('label', { class: 'switch' },
        el('input', {
          type: 'checkbox',
          checked: s.showMenards,
          onchange: (e) => { s.showMenards = e.target.checked; ctx.save(); },
        }),
        el('span', { class: 'knob' })))));

  // --- about ---
  root.append(el('div', { class: 'card' },
    el('h2', {}, 'About'),
    el('div', { class: 'muted small' },
      `Yard Tools v${APP_VERSION}. Your projects and prices are saved on this device only. ` +
      'Tip: "Copy / share list" on the List tab is a quick way to back up a project — text it to yourself. ' +
      'Quantities are rounded up to what you can actually buy; treat costs as ballpark and confirm at the store.'),
    !storageAvailable
      ? el('div', { class: 'warn', style: 'margin:10px 0 0' },
          'Saving is unavailable (private browsing?). Changes will be lost when you close the app.')
      : null));
}
