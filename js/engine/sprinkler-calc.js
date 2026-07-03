// Sprinkler / irrigation materials for four system types:
//   rotor  — in-ground rotors for large lawns
//   spray  — in-ground pop-up sprays for small/medium lawns
//   drip   — inline-emitter drip tubing for beds
//   hose   — hose-end sprinklers, no digging
// Pure function — no DOM, no storage.

import {
  SPRINKLER_TYPES, DEFAULT_SUPPLY_GPM,
  PIPE_ROLL_FT, MAINLINE_EXTRA_FT, LATERAL_FUDGE,
  DRIP_LINE_FT_PER_SQFT, DRIP_ROLL_FT, DRIP_STAKE_SPACING_FT,
  VALVES_PER_BOX,
} from './constants.js';

export const SPRINKLER_TOOLS_INGROUND = [
  'Trenching shovel (or rent a trencher/pipe puller for big jobs)',
  'Poly pipe cutter',
  'Wire strippers (for valve wiring)',
  'Tape measure + marking paint or flags',
  'Work gloves',
];

export const SPRINKLER_TOOLS_SIMPLE = [
  'Scissors or pruners (cutting tubing)',
  'Tape measure',
];

export const SPRINKLER_NOTES = [
  'Measure your real water supply: time how long a 5-gallon bucket takes to fill from the outdoor spigot — GPM = 300 ÷ seconds.',
  'Call 811 before trenching — free utility line marking.',
  'In freezing climates, plan for a fall blowout (compressed air) of in-ground systems.',
];

export function calcSprinklerMaterials({ areaSqFt, options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];
  const type = SPRINKLER_TYPES[options.type] ? options.type : 'rotor';
  const inground = type === 'rotor' || type === 'spray';
  const tools = inground ? SPRINKLER_TOOLS_INGROUND : SPRINKLER_TOOLS_SIMPLE;

  const A = (isFinite(areaSqFt) && areaSqFt > 0) ? areaSqFt : 0;
  if (A === 0) return { lines, tools, notes: SPRINKLER_NOTES, warnings };

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  if (inground) {
    const t = SPRINKLER_TYPES[type];
    const heads = Math.ceil(A / t.sqftPerHead);
    const supplyGpm = (isFinite(options.supplyGpm) && options.supplyGpm > 0) ? options.supplyGpm : DEFAULT_SUPPLY_GPM;
    const totalGpm = heads * t.gpmPerHead;
    const zones = Math.max(1, Math.ceil(totalGpm / supplyGpm));

    const headKey = type === 'rotor' ? 'rotor_head' : 'spray_head';
    const headLabel = type === 'rotor' ? 'Rotor heads' : 'Pop-up spray heads';
    line(headKey, headLabel, heads, 'heads',
      `~${t.sqftPerHead} sq ft each with head-to-head overlap · ${totalGpm.toFixed(1)} GPM total`,
      type === 'rotor' ? 'rotor sprinkler head' : 'pop-up spray sprinkler head');

    line('swing_kit', 'Swing pipe kits (one per head)', heads, 'kits',
      'Flexible riser between pipe and head — saves heads from mower damage', 'sprinkler swing pipe kit');

    const pipeFt = heads * t.spacingFt * LATERAL_FUDGE + MAINLINE_EXTRA_FT * zones;
    line('poly_pipe_roll', 'Poly pipe (100 ft rolls)', Math.ceil(pipeFt / PIPE_ROLL_FT), 'rolls',
      `~${Math.ceil(pipeFt)} ft of laterals and mainline (plus fittings per your layout)`, 'poly irrigation pipe 100 ft');

    line('zone_valve', 'Zone valves', zones, 'valves',
      `${zones} zone${zones > 1 ? 's' : ''} at ${supplyGpm} GPM supply — measure yours (bucket test) and adjust in options`,
      'sprinkler zone valve');
    line('valve_box', 'Valve boxes', Math.ceil(zones / VALVES_PER_BOX), 'boxes',
      `Holds up to ${VALVES_PER_BOX} valves each`, 'irrigation valve box');
    line('controller', 'Sprinkler controller', 1, 'unit',
      `Needs at least ${zones} zone${zones > 1 ? 's' : ''}`, 'sprinkler controller');
    line('backflow', 'Backflow preventer', 1, 'unit',
      'Required by code — keeps irrigation water out of your drinking water', 'irrigation backflow preventer');
    line('wire_roll', 'Irrigation wire (100 ft)', 1, 'roll',
      'Multi-strand; one wire per valve + common', 'sprinkler wire');
  } else if (type === 'drip') {
    const lineFt = A * DRIP_LINE_FT_PER_SQFT;
    line('drip_tubing_roll', 'Drip emitter tubing (100 ft rolls)', Math.ceil(lineFt / DRIP_ROLL_FT), 'rolls',
      `~${Math.ceil(lineFt)} ft on a 12 in grid through the bed`, 'drip irrigation emitter tubing');
    const stakes = Math.ceil(lineFt / DRIP_STAKE_SPACING_FT);
    line('drip_stakes_10pk', 'Tubing stakes (10-packs)', Math.ceil(stakes / 10), 'packs',
      `~${stakes} stakes, one every ${DRIP_STAKE_SPACING_FT} ft`, 'drip tubing stakes');
    line('drip_faucet_kit', 'Faucet kit (filter + pressure regulator)', 1, 'kit',
      'Connects drip line to a standard spigot', 'drip irrigation faucet kit');
    line('hose_timer', 'Hose faucet timer', 1, 'unit',
      'Automates watering — battery powered', 'hose faucet timer');
  } else { // hose-end
    const t = SPRINKLER_TYPES.hose;
    const units = Math.ceil(A / t.sqftPerUnit);
    line('hose_sprinkler', 'Hose-end sprinklers', units, 'sprinklers',
      `~${t.sqftPerUnit.toLocaleString()} sq ft each (oscillating or impact on a base)`, 'oscillating sprinkler');
    line('garden_hose', 'Garden hoses (50 ft)', units, 'hoses', 'One per sprinkler', 'garden hose 50 ft');
    line('hose_timer', 'Hose faucet timer', 1, 'unit',
      'A 2-outlet timer runs two sprinklers on schedules — great for new grass', 'hose faucet timer 2 outlet');
  }

  return { lines, tools, notes: SPRINKLER_NOTES, warnings };
}
