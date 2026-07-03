// Engine tests with hand-computed fixtures.
// Runs two ways:
//   Browser:  open tests/test.html (via any static server)
//   Node:     node tests/engine.test.js   (if Node is installed)

import { shapeArea, shapePerimeter, summarizeShapes } from '../js/engine/geometry.js';
import { calcPaverMaterials } from '../js/engine/paver-calc.js';
import { calcGrassMaterials } from '../js/engine/grass-calc.js';
import { calcMulchMaterials } from '../js/engine/mulch-calc.js';
import { calcGravelMaterials } from '../js/engine/gravel-calc.js';
import { calcConcreteMaterials } from '../js/engine/concrete-calc.js';
import { calcFenceMaterials } from '../js/engine/fence-calc.js';
import { calcPlantsMaterials } from '../js/engine/plants-calc.js';
import { calcSprinklerMaterials } from '../js/engine/sprinkler-calc.js';
import { getPrices, DEFAULT_PRICES } from '../js/engine/constants.js';

const results = [];

function check(name, actual, expected, eps = 1e-6) {
  const pass = (typeof expected === 'number')
    ? Math.abs(actual - expected) <= eps
    : actual === expected;
  results.push({ name, pass, actual, expected });
}

function findLine(res, key) {
  return res.lines.find(l => l.key === key);
}

export function runTests() {
  results.length = 0;
  const prices = getPrices();

  // --- Geometry: single shapes -------------------------------------------
  const rect = { kind: 'rect', mode: 'add', dims: { widthFt: 12, lengthFt: 12 } };
  check('rect 12x12 area = 144', shapeArea(rect), 144);
  check('rect 12x12 perimeter = 48', shapePerimeter(rect), 48);

  const circle = { kind: 'circle', mode: 'add', dims: { diameterFt: 5 } };
  check('circle d=5 area ≈ 19.635', shapeArea(circle), Math.PI * 6.25, 1e-9);
  check('circle d=5 perimeter ≈ 15.708', shapePerimeter(circle), Math.PI * 5, 1e-9);

  const tri = { kind: 'triangle', mode: 'add', dims: { baseFt: 6, heightFt: 8 } };
  check('triangle 6x8 area = 24', shapeArea(tri), 24);
  check('triangle 6x8 perimeter = 24 (right tri)', shapePerimeter(tri), 24);

  // Invalid dims contribute zero
  check('rect with 0 width = 0 area', shapeArea({ kind: 'rect', dims: { widthFt: 0, lengthFt: 10 } }), 0);
  check('negative dim = 0 area', shapeArea({ kind: 'rect', dims: { widthFt: -3, lengthFt: 10 } }), 0);

  // --- Geometry: composites ------------------------------------------------
  const yard = summarizeShapes([
    { kind: 'rect', mode: 'add', dims: { widthFt: 10, lengthFt: 20 } },
    { kind: 'circle', mode: 'subtract', dims: { diameterFt: 5 } },
  ]);
  check('10x20 minus d5 circle ≈ 180.365', yard.netSqFt, 200 - Math.PI * 6.25, 1e-9);
  check('cutout does not add perimeter', yard.perimeterFt, 60);
  check('no warnings on normal yard', yard.warnings.length, 0);

  const overcut = summarizeShapes([
    { kind: 'rect', mode: 'add', dims: { widthFt: 5, lengthFt: 5 } },
    { kind: 'rect', mode: 'subtract', dims: { widthFt: 10, lengthFt: 10 } },
  ]);
  check('overcut clamps to 0', overcut.netSqFt, 0);
  check('overcut warns', overcut.warnings.length > 0, true);

  const huge = summarizeShapes([{ kind: 'rect', mode: 'add', dims: { widthFt: 200, lengthFt: 200 } }]);
  check('huge area warns', huge.warnings.length > 0, true);

  check('empty shape list = 0', summarizeShapes([]).netSqFt, 0);

  // --- Paver calc -----------------------------------------------------------
  // 12x12 ft patio (144 sq ft, P=48), 12x12 pavers, 4" gravel, 1" sand, 10% waste
  const patio = calcPaverMaterials({
    areaSqFt: 144, perimeterFt: 48,
    options: { preset: '12x12', gravelDepthIn: 4, sandDepthIn: 1, wastePct: 10 },
    prices,
  });
  check('pavers: ceil(144×1.1/1) = 159', findLine(patio, 'pavers').qty, 159);
  // gravel: 144 × 4/12 × 1.1 = 52.8 cu ft → /0.5 = 105.6 → 106 bags
  check('gravel bags = 106', findLine(patio, 'paver_base_bag').qty, 106);
  check('gravel detail mentions 1.96 cu yd', findLine(patio, 'paver_base_bag').detail.includes('1.96'), true);
  // sand: 144 × 1/12 = 12 cu ft → 24 bags
  check('sand bags = 24', findLine(patio, 'leveling_sand_bag').qty, 24);
  // poly sand: ceil(144/65) = 3
  check('poly sand bags = 3', findLine(patio, 'poly_sand_bag').qty, 3);
  // fabric: 144×1.1 = 158.4 → ceil(158.4/150) = 2 rolls
  check('fabric rolls = 2', findLine(patio, 'fabric_roll').qty, 2);
  // edging: ceil(48/6) = 8 sections; spikes ceil(48/2)=24 → 3 packs
  check('edging sections = 8', findLine(patio, 'edging_section').qty, 8);
  check('spike packs = 3', findLine(patio, 'spikes_10pk').qty, 3);
  check('paver line total = 159 × $2.00', findLine(patio, 'pavers').lineTotal, 318);

  // Plan fixture: 180.365 sq ft, 12x12 pavers, 10% waste → 199
  const p2 = calcPaverMaterials({
    areaSqFt: 200 - Math.PI * 6.25, perimeterFt: 60,
    options: { preset: '12x12', wastePct: 10 }, prices,
  });
  check('180.37 sq ft → 199 pavers', findLine(p2, 'pavers').qty, 199);

  // Edging override + exclusion
  const p3 = calcPaverMaterials({
    areaSqFt: 144, perimeterFt: 48,
    options: { preset: '12x12', wastePct: 10, edgingOverrideFt: 30, edgingExcludeFt: 12 },
    prices,
  });
  check('edging override 30−12=18 ft → 3 sections', findLine(p3, 'edging_section').qty, 3);

  // Exclusion covering the whole edge drops edging lines
  const p4 = calcPaverMaterials({
    areaSqFt: 144, perimeterFt: 48,
    options: { preset: '12x12', wastePct: 10, edgingExcludeFt: 48 },
    prices,
  });
  check('fully excluded edge → no edging line', findLine(p4, 'edging_section'), undefined);

  // Custom paver 5x10 in → 0.3472 sq ft
  const p5 = calcPaverMaterials({
    areaSqFt: 100, perimeterFt: 40,
    options: { preset: 'custom', customWIn: 5, customLIn: 10, wastePct: 10 },
    prices,
  });
  check('custom 5x10 → ceil(110/0.34722) = 317', findLine(p5, 'pavers').qty, 317);

  // Invalid custom size warns, still returns base materials
  const p6 = calcPaverMaterials({
    areaSqFt: 100, perimeterFt: 40,
    options: { preset: 'custom', customWIn: 0, customLIn: 10, wastePct: 10 },
    prices,
  });
  check('invalid custom size warns', p6.warnings.length > 0, true);
  check('invalid custom size still lists gravel', !!findLine(p6, 'paver_base_bag'), true);

  // Zero area → empty list, no NaN
  const p0 = calcPaverMaterials({ areaSqFt: 0, perimeterFt: 0, options: { preset: '12x12' }, prices });
  check('zero area → no paver lines', p0.lines.length, 0);

  // --- Grass calc -------------------------------------------------------------
  // 1000 sq ft tall fescue seed
  const g1 = calcGrassMaterials({
    areaSqFt: 1000,
    options: { mode: 'seed', grassType: 'tall_fescue', topsoilDepthIn: 3, seedCover: 'straw' },
    prices,
  });
  check('tall fescue 1000 sq ft = 9 lb seed', findLine(g1, 'seed_per_lb').qty, 9);
  // topsoil: 1000 × 3/12 = 250 cu ft → /0.75 = 333.3 → 334 bags
  check('topsoil bags = 334', findLine(g1, 'topsoil_bag').qty, 334);
  check('topsoil detail mentions 9.26 cu yd', findLine(g1, 'topsoil_bag').detail.includes('9.26'), true);
  check('fertilizer = 1 bag', findLine(g1, 'starter_fert_bag').qty, 1);
  check('straw = 2 bales', findLine(g1, 'straw_bale').qty, 2);

  // Seed rounds UP to half pound: KBG 550 sq ft = 1.65 lb → 2.0? No: ceil(1.65×2)/2 = 2.0... check 510: 1.53 → 2? ceil(3.06)/2 = 2.0. Use 450: 1.35 → 1.5
  const g2 = calcGrassMaterials({ areaSqFt: 450, options: { mode: 'seed', grassType: 'kbg', topsoilDepthIn: 0 }, prices });
  check('KBG 450 sq ft = 1.5 lb (rounds up to half lb)', findLine(g2, 'seed_per_lb').qty, 1.5);
  check('topsoil depth 0 → no topsoil line', findLine(g2, 'topsoil_bag'), undefined);

  // Sod: 1000 sq ft → 1050 → 3 pallets
  const g3 = calcGrassMaterials({ areaSqFt: 1000, options: { mode: 'sod', topsoilDepthIn: 2 }, prices });
  check('sod 1000 sq ft = 3 pallets', findLine(g3, 'sod_pallet').qty, 3);
  check('sod detail shows 105 rolls', findLine(g3, 'sod_pallet').detail.includes('105'), true);
  check('sod mode has no seed line', findLine(g3, 'seed_per_lb'), undefined);
  check('sod mode has no straw line', findLine(g3, 'straw_bale'), undefined);

  // Peat cover: 1000 sq ft → ceil(1000/385) = 3 bales
  const g4 = calcGrassMaterials({ areaSqFt: 1000, options: { mode: 'seed', grassType: 'kbg', seedCover: 'peat', topsoilDepthIn: 0 }, prices });
  check('peat = 3 bales', findLine(g4, 'peat_bale').qty, 3);

  // Zero area
  const g0 = calcGrassMaterials({ areaSqFt: 0, options: { mode: 'seed' }, prices });
  check('zero area → no grass lines', g0.lines.length, 0);

  // --- Mulch calc -------------------------------------------------------------
  const m1 = calcMulchMaterials({ areaSqFt: 200, options: { type: 'hardwood', depthIn: 3, fabric: true }, prices });
  check('mulch 200 sq ft @3in = 25 bags', findLine(m1, 'mulch_bag').qty, 25);
  check('mulch detail mentions 1.85 cu yd', findLine(m1, 'mulch_bag').detail.includes('1.85'), true);
  check('mulch fabric = 2 rolls', findLine(m1, 'fabric_roll').qty, 2);
  const m2 = calcMulchMaterials({ areaSqFt: 200, options: { depthIn: 3, fabric: false }, prices });
  check('mulch no fabric line when off', findLine(m2, 'fabric_roll'), undefined);
  check('mulch zero area → empty', calcMulchMaterials({ areaSqFt: 0, options: {}, prices }).lines.length, 0);

  // --- Gravel calc -------------------------------------------------------------
  const gv1 = calcGravelMaterials({ areaSqFt: 60, options: { type: 'crushed', depthIn: 3 }, prices });
  check('crushed 60 sq ft @3in = 33 bags (×1.1)', findLine(gv1, 'gravel_bag').qty, 33);
  const gv2 = calcGravelMaterials({ areaSqFt: 60, options: { type: 'pea', depthIn: 3 }, prices });
  check('pea gravel no compaction = 30 bags', findLine(gv2, 'gravel_bag').qty, 30);

  // --- Concrete calc -------------------------------------------------------------
  const c1 = calcConcreteMaterials({ areaSqFt: 100, perimeterFt: 40, options: { thicknessIn: 4 }, prices });
  check('concrete 10x10 @4in = 62 bags', findLine(c1, 'concrete_80lb').qty, 62);
  check('concrete detail suggests ready-mix over 1 cu yd', findLine(c1, 'concrete_80lb').detail.includes('ready-mix'), true);
  check('concrete base = 74 bags', findLine(c1, 'paver_base_bag').qty, 74);
  check('remesh = 5 sheets', findLine(c1, 'remesh_sheet').qty, 5);
  check('form boards = 6', findLine(c1, 'form_board').qty, 6);
  const c2 = calcConcreteMaterials({ areaSqFt: 100, perimeterFt: 40, options: { thicknessIn: 4, base: false, mesh: false, forms: false }, prices });
  check('concrete options off → only mix line', c2.lines.length, 1);

  // --- Fence calc -----------------------------------------------------------------
  const f1 = calcFenceMaterials({ options: { lengthFt: 100, spacingFt: 8, style: 'panels', gates: 1 }, prices });
  check('fence 100ft/8ft/1 gate: 14 posts', findLine(f1, 'fence_post').qty, 14);
  check('fence panels = 12', findLine(f1, 'fence_panel').qty, 12);
  check('fence post concrete = 28 bags', findLine(f1, 'post_concrete_bag').qty, 28);
  check('fence gate kits = 1', findLine(f1, 'gate_kit').qty, 1);
  const f2 = calcFenceMaterials({ options: { lengthFt: 100, spacingFt: 8, style: 'picket', gates: 1 }, prices });
  check('picket rails = 24', findLine(f2, 'fence_rail').qty, 24);
  check('pickets = 192 (2 per ft)', findLine(f2, 'fence_picket').qty, 192);
  const f3 = calcFenceMaterials({ options: { lengthFt: 100, spacingFt: 8, style: 'rail', gates: 0 }, prices });
  check('split rail = 26 rails (13 sections × 2)', findLine(f3, 'split_rail').qty, 26);
  check('split rail has no concrete', findLine(f3, 'post_concrete_bag'), undefined);
  const f4 = calcFenceMaterials({ options: { lengthFt: 4, spacingFt: 8, style: 'panels', gates: 1 }, prices });
  check('gates ≥ length warns, no lines', f4.warnings.length > 0 && f4.lines.length === 0, true);
  check('fence no length → empty', calcFenceMaterials({ options: {}, prices }).lines.length, 0);

  // --- Plants calc ---------------------------------------------------------------------
  const pl1 = calcPlantsMaterials({ areaSqFt: 100, options: { layout: 'grid', spacingFt: 3 }, prices });
  check('plants grid 100 sq ft @3ft = 11', findLine(pl1, 'plant_each').qty, 11);
  check('plants soil = 11 bags', findLine(pl1, 'garden_soil_bag').qty, 11);
  const pl2 = calcPlantsMaterials({ areaSqFt: 0, options: { layout: 'row', spacingFt: 3, rowLengthFt: 20 }, prices });
  check('plants row 20 ft @3ft = 7 (ends included)', findLine(pl2, 'plant_each').qty, 7);
  const pl3 = calcPlantsMaterials({ areaSqFt: 0, options: { layout: 'grid', spacingFt: 3 }, prices });
  check('plants grid needs area → empty', pl3.lines.length, 0);

  // --- Sprinkler calc ----------------------------------------------------------------------
  const s1 = calcSprinklerMaterials({ areaSqFt: 5000, options: { type: 'rotor', supplyGpm: 12 }, prices });
  check('rotor 5000 sq ft = 7 heads', findLine(s1, 'rotor_head').qty, 7);
  check('rotor zones = 2 (21 GPM / 12)', findLine(s1, 'zone_valve').qty, 2);
  check('rotor pipe = 4 rolls (331 ft)', findLine(s1, 'poly_pipe_roll').qty, 4);
  check('rotor swing kits = 7', findLine(s1, 'swing_kit').qty, 7);
  check('rotor valve boxes = 1', findLine(s1, 'valve_box').qty, 1);
  check('rotor has controller + backflow + wire',
    !!findLine(s1, 'controller') && !!findLine(s1, 'backflow') && !!findLine(s1, 'wire_roll'), true);
  const s2 = calcSprinklerMaterials({ areaSqFt: 1000, options: { type: 'spray', supplyGpm: 12 }, prices });
  check('spray 1000 sq ft = 8 heads', findLine(s2, 'spray_head').qty, 8);
  check('spray zones = 1', findLine(s2, 'zone_valve').qty, 1);
  check('spray pipe = 2 rolls (164 ft)', findLine(s2, 'poly_pipe_roll').qty, 2);
  const s3 = calcSprinklerMaterials({ areaSqFt: 200, options: { type: 'drip' }, prices });
  check('drip 200 sq ft = 3 tubing rolls', findLine(s3, 'drip_tubing_roll').qty, 3);
  check('drip stakes = 9 packs (88 stakes)', findLine(s3, 'drip_stakes_10pk').qty, 9);
  check('drip has faucet kit + timer', !!findLine(s3, 'drip_faucet_kit') && !!findLine(s3, 'hose_timer'), true);
  const s4 = calcSprinklerMaterials({ areaSqFt: 6000, options: { type: 'hose' }, prices });
  check('hose-end 6000 sq ft = 3 sprinklers', findLine(s4, 'hose_sprinkler').qty, 3);
  check('hose-end hoses = 3', findLine(s4, 'garden_hose').qty, 3);
  check('sprinkler zero area → empty', calcSprinklerMaterials({ areaSqFt: 0, options: { type: 'rotor' }, prices }).lines.length, 0);

  // --- Prices ---------------------------------------------------------------
  check('override wins', getPrices({ poly_sand_bag: 30 }).poly_sand_bag, 30);
  check('bad override ignored', getPrices({ poly_sand_bag: -5 }).poly_sand_bag, DEFAULT_PRICES.poly_sand_bag.price);
  check('missing override falls back', getPrices({}).topsoil_bag, DEFAULT_PRICES.topsoil_bag.price);

  return results;
}

// Auto-run under Node
if (typeof process !== 'undefined' && process.versions?.node) {
  const res = runTests();
  let failed = 0;
  for (const r of res) {
    if (!r.pass) {
      failed++;
      console.error(`FAIL  ${r.name}\n      expected ${r.expected}, got ${r.actual}`);
    } else {
      console.log(`ok    ${r.name}`);
    }
  }
  console.log(`\n${res.length - failed}/${res.length} passed`);
  process.exitCode = failed ? 1 : 0;
}
