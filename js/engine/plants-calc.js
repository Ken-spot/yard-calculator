// Tree & bush spacing / count. Grid layout uses the project area;
// row layout uses its own length input. Pure function — no DOM, no storage.

import { SOIL_BAGS_PER_PLANT } from './constants.js';

export const PLANTS_TOOLS = [
  'Round-point shovel',
  'Garden hose (water in well at planting)',
  'Tape measure + marking paint or flags',
  'Work gloves',
];

export const PLANTS_NOTES = [
  'Space plants by their MATURE width, not the pot size — for a privacy hedge use about 2/3 of mature width.',
  'Dig holes 2× the width of the root ball but no deeper than it.',
  'Call 811 before digging near utility lines.',
];

export function calcPlantsMaterials({ areaSqFt, options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  const spacingFt = (isFinite(options.spacingFt) && options.spacingFt > 0) ? options.spacingFt : 3;
  const layout = options.layout === 'row' ? 'row' : 'grid';

  let count = 0;
  let detail = '';
  if (layout === 'grid') {
    const A = (isFinite(areaSqFt) && areaSqFt > 0) ? areaSqFt : 0;
    if (A === 0) return { lines, tools: PLANTS_TOOLS, notes: PLANTS_NOTES, warnings };
    count = Math.max(1, Math.round(A / (spacingFt * spacingFt)));
    detail = `Fills ${Math.round(A)} sq ft on a ${spacingFt} ft grid`;
  } else {
    const len = (isFinite(options.rowLengthFt) && options.rowLengthFt > 0) ? options.rowLengthFt : 0;
    if (len === 0) return { lines, tools: PLANTS_TOOLS, notes: PLANTS_NOTES, warnings };
    count = Math.floor(len / spacingFt) + 1;
    detail = `${len} ft row, one plant every ${spacingFt} ft (ends included)`;
  }

  line('plant_each', 'Plants (trees / bushes)', count, 'plants', detail, 'shrub');

  if (options.soilBags !== false) {
    line('garden_soil_bag', 'Garden soil (1 cu ft bags)', count * SOIL_BAGS_PER_PLANT, 'bags',
      `${SOIL_BAGS_PER_PLANT} bag per shrub — use 2–3 for larger trees`, 'garden soil bag');
  }

  return { lines, tools: PLANTS_TOOLS, notes: PLANTS_NOTES, warnings };
}
