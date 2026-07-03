// Paver project materials. Pure function — no DOM, no storage.
//
// calcPaverMaterials({ areaSqFt, perimeterFt, options, prices })
//   → { lines: MaterialLine[], tools: string[], warnings: string[] }
//
// MaterialLine = { key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal }

import {
  PAVER_PRESETS, GRAVEL_COMPACTION, GRAVEL_TONS_PER_CUYD,
  BASE_BAG_CUFT, SAND_BAG_CUFT, POLY_SAND_SQFT_PER_BAG,
  FABRIC_WASTE, FABRIC_ROLL_SQFT,
  EDGING_SECTION_FT, SPIKE_SPACING_FT, SPIKES_PER_PACK,
  BULK_SUGGEST_CUYD,
} from './constants.js';

export const PAVER_TOOLS = [
  'Plate compactor (rent, ~$60–90/day)',
  'Hand tamper (for edges/corners)',
  'Rubber mallet',
  '4 ft level',
  'String line + stakes',
  'Two 1 in screed pipes + straight 2×4 board',
  'Angle grinder or masonry saw with diamond blade (rent, for cut pavers)',
  'Chalk line',
  'Shovel and garden rake',
  'Wheelbarrow',
  'Push broom (for polymeric sand)',
  'Garden hose with spray nozzle',
  'Knee pads, work gloves, safety glasses',
];

function paverSizeIn(options) {
  if (options.preset === 'custom') {
    const w = Number(options.customWIn), l = Number(options.customLIn);
    return (isFinite(w) && w > 0 && isFinite(l) && l > 0) ? { wIn: w, lIn: l } : null;
  }
  const p = PAVER_PRESETS[options.preset];
  return p ? { wIn: p.wIn, lIn: p.lIn } : null;
}

export function calcPaverMaterials({ areaSqFt, perimeterFt = 0, options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];
  const A = (isFinite(areaSqFt) && areaSqFt > 0) ? areaSqFt : 0;
  if (A === 0) return { lines, tools: PAVER_TOOLS, warnings };

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  // --- Pavers ---
  const size = paverSizeIn(options);
  if (!size) {
    warnings.push('Enter a valid paver size to count pavers.');
  } else {
    const paverSqFt = (size.wIn * size.lIn) / 144;
    const wastePct = isFinite(options.wastePct) ? Math.max(0, options.wastePct) : 10;
    const qty = Math.ceil((A * (1 + wastePct / 100)) / paverSqFt);
    const sizeLabel = options.preset === 'custom'
      ? `${size.wIn}×${size.lIn} in` : options.preset.replace('x', '×') + ' in';
    const priceKey = options.preset === 'custom' ? 'paver_custom' : `paver_${options.preset}`;
    line('pavers', `Pavers (${sizeLabel})`, qty, 'pavers',
      `Covers ${Math.round(A)} sq ft + ${wastePct}% for cuts and breakage`,
      `${sizeLabel.replace('×', 'x').replace(' in', ' in.')} concrete paver`, priceKey);
  }

  // --- Gravel base (crushed stone / paver base) ---
  const gravelDepthIn = isFinite(options.gravelDepthIn) && options.gravelDepthIn > 0 ? options.gravelDepthIn : 4;
  const gravelCuFt = A * (gravelDepthIn / 12) * GRAVEL_COMPACTION;
  const gravelCuYd = gravelCuFt / 27;
  const gravelBags = Math.ceil(gravelCuFt / BASE_BAG_CUFT);
  let gravelDetail = `${gravelDepthIn} in deep = ${gravelCuYd.toFixed(2)} cu yd (includes 10% for compaction)`;
  if (gravelCuYd >= BULK_SUGGEST_CUYD) {
    gravelDetail += ` · ~${(gravelCuYd * GRAVEL_TONS_PER_CUYD).toFixed(1)} tons — bulk delivery is usually much cheaper than bags at this size`;
  }
  line('paver_base_bag', 'Paver base gravel (0.5 cu ft bags)', gravelBags, 'bags',
    gravelDetail, 'paver base 0.5 cu ft');

  // --- Bedding sand ---
  const sandDepthIn = isFinite(options.sandDepthIn) && options.sandDepthIn > 0 ? options.sandDepthIn : 1;
  const sandCuFt = A * (sandDepthIn / 12);
  const sandCuYd = sandCuFt / 27;
  const sandBags = Math.ceil(sandCuFt / SAND_BAG_CUFT);
  let sandDetail = `${sandDepthIn} in screeded layer = ${sandCuYd.toFixed(2)} cu yd`;
  if (sandCuYd >= BULK_SUGGEST_CUYD) sandDetail += ' · consider bulk delivery';
  line('leveling_sand_bag', 'Bedding / leveling sand (0.5 cu ft bags)', sandBags, 'bags',
    sandDetail, 'paver leveling sand');

  // --- Polymeric joint sand ---
  const polyBags = Math.ceil(A / POLY_SAND_SQFT_PER_BAG);
  line('poly_sand_bag', 'Polymeric joint sand (50 lb bags)', polyBags, 'bags',
    `~${POLY_SAND_SQFT_PER_BAG} sq ft per bag with standard joints; large-format pavers need less`,
    'polymeric sand 50 lb');

  // --- Landscape fabric ---
  const fabricSqFt = A * FABRIC_WASTE;
  const fabricRolls = Math.ceil(fabricSqFt / FABRIC_ROLL_SQFT);
  line('fabric_roll', 'Landscape fabric (3×50 ft rolls)', fabricRolls, 'rolls',
    `${Math.ceil(fabricSqFt)} sq ft including 10% overlap at seams`,
    'landscape fabric roll');

  // --- Edging + spikes ---
  const override = options.edgingOverrideFt;
  const baseEdge = (isFinite(override) && override > 0) ? override : perimeterFt;
  const exclude = isFinite(options.edgingExcludeFt) && options.edgingExcludeFt > 0 ? options.edgingExcludeFt : 0;
  const edgeFt = Math.max(0, baseEdge - exclude);
  if (edgeFt > 0) {
    const sections = Math.ceil(edgeFt / EDGING_SECTION_FT);
    line('edging_section', 'Paver edging (6 ft sections)', sections, 'sections',
      `${Math.ceil(edgeFt)} ft of exposed edge`, 'paver edging');
    const spikes = Math.ceil(edgeFt / SPIKE_SPACING_FT);
    const packs = Math.ceil(spikes / SPIKES_PER_PACK);
    line('spikes_10pk', 'Edging spikes (10-packs)', packs, 'packs',
      `~${spikes} spikes at 1 per ${SPIKE_SPACING_FT} ft — use more on curves`, 'paver edging spikes');
  }

  return { lines, tools: PAVER_TOOLS, warnings };
}
