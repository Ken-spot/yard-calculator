// Mulch bed materials. Pure function — no DOM, no storage.

import { MULCH_BAG_CUFT, MULCH_TYPES, FABRIC_WASTE, FABRIC_ROLL_SQFT, BULK_SUGGEST_CUYD } from './constants.js';

export const MULCH_TOOLS = [
  'Wheelbarrow',
  'Garden rake (bow rake)',
  'Work gloves',
];

export function calcMulchMaterials({ areaSqFt, options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];
  const A = (isFinite(areaSqFt) && areaSqFt > 0) ? areaSqFt : 0;
  if (A === 0) return { lines, tools: MULCH_TOOLS, warnings };

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  const type = MULCH_TYPES[options.type] || MULCH_TYPES.hardwood;
  const depthIn = isFinite(options.depthIn) && options.depthIn > 0 ? options.depthIn : 3;

  const cuFt = A * (depthIn / 12);
  const cuYd = cuFt / 27;
  const bags = Math.ceil(cuFt / MULCH_BAG_CUFT);
  let detail = `${depthIn} in deep = ${cuYd.toFixed(2)} cu yd`;
  if (cuYd >= BULK_SUGGEST_CUYD) detail += ' — bulk delivery is usually much cheaper than bags at this size';
  line('mulch_bag', `Mulch — ${type.label} (2 cu ft bags)`, bags, 'bags', detail, type.query);

  if (options.fabric) {
    const fabricSqFt = A * FABRIC_WASTE;
    line('fabric_roll', 'Landscape fabric (3×50 ft rolls)', Math.ceil(fabricSqFt / FABRIC_ROLL_SQFT), 'rolls',
      `${Math.ceil(fabricSqFt)} sq ft including 10% overlap`, 'landscape fabric roll');
  }

  return { lines, tools: MULCH_TOOLS, warnings };
}
