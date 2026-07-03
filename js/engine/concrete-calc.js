// Concrete slab materials (pads, walkways, small slabs).
// Pure function — no DOM, no storage.

import {
  CONCRETE_BAG80_YIELD_CUFT, CONCRETE_WASTE, REMESH_SHEET_SQFT, FORM_BOARD_FT,
  READY_MIX_MIN_CUYD, GRAVEL_COMPACTION, BASE_BAG_CUFT,
} from './constants.js';

export const CONCRETE_TOOLS = [
  'Wheelbarrow or mixing tub (or rent a mixer for 20+ bags)',
  'Magnesium float and steel trowel',
  'Concrete edger and groover',
  '4 ft level and string line',
  'Circular saw, drill, and screws (for forms)',
  'Wood stakes for forms (1 per ~3 ft)',
  'Bull float (rent, for slabs over ~8 ft wide)',
  'Rubber boots and waterproof gloves — wet concrete burns skin',
];

export const CONCRETE_NOTES = [
  'Mixing more than ~1 cu yd by hand is brutal — at that size, price a ready-mix truck delivery first.',
  'Cut control joints (or groove them) every 8–10 ft to control cracking.',
];

export function calcConcreteMaterials({ areaSqFt, perimeterFt = 0, options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];
  const A = (isFinite(areaSqFt) && areaSqFt > 0) ? areaSqFt : 0;
  if (A === 0) return { lines, tools: CONCRETE_TOOLS, notes: CONCRETE_NOTES, warnings };

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  const thicknessIn = isFinite(options.thicknessIn) && options.thicknessIn > 0 ? options.thicknessIn : 4;

  // --- concrete mix ---
  const cuFt = A * (thicknessIn / 12) * CONCRETE_WASTE;
  const cuYd = cuFt / 27;
  const bags = Math.ceil(cuFt / CONCRETE_BAG80_YIELD_CUFT);
  let detail = `${thicknessIn} in slab = ${cuYd.toFixed(2)} cu yd (includes 10% extra)`;
  if (cuYd >= READY_MIX_MIN_CUYD) {
    detail += ` — at ${bags} bags, get a ready-mix truck quote instead; it's cheaper and far easier`;
  }
  line('concrete_80lb', 'Concrete mix (80 lb bags)', bags, 'bags', detail, 'concrete mix 80 lb');

  // --- gravel base ---
  if (options.base !== false) {
    const baseCuFt = A * (4 / 12) * GRAVEL_COMPACTION;
    line('paver_base_bag', 'Gravel base, 4 in (0.5 cu ft bags)', Math.ceil(baseCuFt / BASE_BAG_CUFT), 'bags',
      `${(baseCuFt / 27).toFixed(2)} cu yd — compacted base prevents cracking`, 'paver base 0.5 cu ft');
  }

  // --- reinforcement ---
  if (options.mesh !== false) {
    line('remesh_sheet', 'Remesh sheets (42×84 in)', Math.ceil(A / REMESH_SHEET_SQFT), 'sheets',
      'Overlap sheets one square and keep mesh mid-slab', 'concrete remesh sheet');
  }

  // --- forms ---
  if (options.forms !== false && perimeterFt > 0) {
    const boardFt = perimeterFt * 1.1;
    line('form_board', 'Form boards (2×4×8 ft)', Math.ceil(boardFt / FORM_BOARD_FT), 'boards',
      `${Math.ceil(boardFt)} ft of forms + stakes every ~3 ft`, '2x4x8 lumber');
  }

  return { lines, tools: CONCRETE_TOOLS, notes: CONCRETE_NOTES, warnings };
}
