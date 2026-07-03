// Standalone gravel materials (paths, pads, driveways, rock beds).
// Pure function — no DOM, no storage.

import { GRAVEL_TYPES, GRAVEL_BAG_CUFT, GRAVEL_TONS_PER_CUYD, FABRIC_WASTE, FABRIC_ROLL_SQFT, BULK_SUGGEST_CUYD } from './constants.js';

export const GRAVEL_TOOLS = [
  'Shovel and garden rake',
  'Wheelbarrow',
  'Hand tamper or plate compactor (rent, for crushed stone)',
  'Work gloves',
];

export function calcGravelMaterials({ areaSqFt, options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];
  const A = (isFinite(areaSqFt) && areaSqFt > 0) ? areaSqFt : 0;
  if (A === 0) return { lines, tools: GRAVEL_TOOLS, warnings };

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  const type = GRAVEL_TYPES[options.type] || GRAVEL_TYPES.crushed;
  const depthIn = isFinite(options.depthIn) && options.depthIn > 0 ? options.depthIn : 3;

  const cuFt = A * (depthIn / 12) * type.compaction;
  const cuYd = cuFt / 27;
  const bags = Math.ceil(cuFt / GRAVEL_BAG_CUFT);
  let detail = `${depthIn} in deep = ${cuYd.toFixed(2)} cu yd`;
  if (type.compaction > 1) detail += ' (includes 10% for compaction)';
  if (cuYd >= BULK_SUGGEST_CUYD) {
    detail += ` · ~${(cuYd * GRAVEL_TONS_PER_CUYD).toFixed(1)} tons — bulk delivery is usually much cheaper than bags at this size`;
  }
  line('gravel_bag', `${type.label} (0.5 cu ft bags)`, bags, 'bags', detail, type.query);

  if (options.fabric) {
    const fabricSqFt = A * FABRIC_WASTE;
    line('fabric_roll', 'Landscape fabric (3×50 ft rolls)', Math.ceil(fabricSqFt / FABRIC_ROLL_SQFT), 'rolls',
      `${Math.ceil(fabricSqFt)} sq ft — keeps gravel from sinking into the soil`, 'landscape fabric roll');
  }

  return { lines, tools: GRAVEL_TOOLS, warnings };
}
