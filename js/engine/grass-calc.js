// Grass project materials (seed or sod). Pure function — no DOM, no storage.
//
// calcGrassMaterials({ areaSqFt, options, prices })
//   → { lines: MaterialLine[], tools: string[], notes: string[], warnings: string[] }

import {
  GRASS_TYPES, SOD_WASTE, SOD_PALLET_SQFT, SOD_ROLL_SQFT,
  TOPSOIL_BAG_CUFT, FERT_SQFT_PER_BAG,
  STRAW_SQFT_PER_BALE, PEAT_SQFT_PER_BALE,
  BULK_SUGGEST_CUYD,
} from './constants.js';

export const GRASS_TOOLS = [
  'Garden rake (bow rake) for grading',
  'Lawn roller (rent or fill-with-water type)',
  'Broadcast or drop spreader (for seed and fertilizer)',
  'Shovel and wheelbarrow',
  'Garden hose + sprinkler (daily watering the first weeks)',
  'Utility knife (sod cutting)',
  'Work gloves',
];

export const GRASS_NOTES = [
  'Optional: compost or soil conditioner worked into the top 2–3 in improves any soil.',
  'Optional: lime — only if a soil test shows acidic soil. A soil test kit is cheap insurance.',
];

export function calcGrassMaterials({ areaSqFt, options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];
  const A = (isFinite(areaSqFt) && areaSqFt > 0) ? areaSqFt : 0;
  if (A === 0) return { lines, tools: GRASS_TOOLS, notes: GRASS_NOTES, warnings };

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  const mode = options.mode === 'sod' ? 'sod' : 'seed';

  if (mode === 'seed') {
    // --- Seed, rounded up to the half pound ---
    const type = GRASS_TYPES[options.grassType] || GRASS_TYPES.sun_shade_mix;
    const lbs = Math.ceil((A / 1000) * type.ratePer1000 * 2) / 2;
    line('seed_per_lb', `Grass seed — ${type.label}`, lbs, 'lb',
      `New-lawn rate: ${type.ratePer1000} lb per 1,000 sq ft`,
      `${type.label} grass seed`);
  } else {
    // --- Sod by the pallet, with roll count as an alternative ---
    const sodSqFt = A * SOD_WASTE;
    const pallets = Math.ceil(sodSqFt / SOD_PALLET_SQFT);
    const rolls = Math.ceil(sodSqFt / SOD_ROLL_SQFT);
    line('sod_pallet', 'Sod (pallets)', pallets, 'pallets',
      `${Math.ceil(sodSqFt)} sq ft with 5% for cuts · = ${rolls} rolls (2×5 ft) if buying by the roll`,
      'sod pallet');
  }

  // --- Topsoil ---
  const depthIn = isFinite(options.topsoilDepthIn) ? options.topsoilDepthIn : 3;
  if (depthIn > 0) {
    const cuFt = A * (depthIn / 12);
    const cuYd = cuFt / 27;
    const bags = Math.ceil(cuFt / TOPSOIL_BAG_CUFT);
    let detail = `${depthIn} in deep = ${cuYd.toFixed(2)} cu yd`;
    if (cuYd >= BULK_SUGGEST_CUYD) detail += ' — bulk delivery is usually much cheaper than bags at this size';
    line('topsoil_bag', 'Topsoil (0.75 cu ft bags)', bags, 'bags', detail, 'topsoil bag');
  }

  // --- Starter fertilizer ---
  const fertBags = Math.ceil(A / FERT_SQFT_PER_BAG);
  line('starter_fert_bag', 'Starter fertilizer', fertBags, 'bags',
    `Covers ~${FERT_SQFT_PER_BAG.toLocaleString()} sq ft per bag`,
    'starter fertilizer new grass');

  // --- Seed cover (seed mode only) ---
  if (mode === 'seed') {
    if (options.seedCover === 'straw') {
      const bales = Math.ceil(A / STRAW_SQFT_PER_BALE);
      line('straw_bale', 'Straw cover', bales, 'bales',
        `Light cover, ~${STRAW_SQFT_PER_BALE} sq ft per bale`, 'straw bale grass seed');
    } else if (options.seedCover === 'peat') {
      const bales = Math.ceil(A / PEAT_SQFT_PER_BALE);
      line('peat_bale', 'Peat moss cover', bales, 'bales',
        `1/4 in cover, ~${PEAT_SQFT_PER_BALE} sq ft per bale`, 'peat moss bale');
    }
  }

  return { lines, tools: GRASS_TOOLS, notes: GRASS_NOTES, warnings };
}
