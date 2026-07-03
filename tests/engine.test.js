// Engine tests with hand-computed fixtures.
// Runs two ways:
//   Browser:  open tests/test.html (via any static server)
//   Node:     node tests/engine.test.js   (if Node is installed)

import { shapeArea, shapePerimeter, summarizeShapes } from '../js/engine/geometry.js';
import { calcPaverMaterials } from '../js/engine/paver-calc.js';
import { calcGrassMaterials } from '../js/engine/grass-calc.js';
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
