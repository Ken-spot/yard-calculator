// ============================================================================
// Yard Tools — every tunable number lives in this file.
// Coverage rates, bag sizes, seed rates, paver presets, and default prices.
// To adjust a formula's assumptions, edit here — nothing else needs to change.
// ============================================================================

// --- Paver presets (nominal inches) -----------------------------------------
export const PAVER_PRESETS = {
  '4x8':   { label: '4 in × 8 in (Holland brick)', wIn: 4,  lIn: 8 },
  '6x6':   { label: '6 in × 6 in',                 wIn: 6,  lIn: 6 },
  '6x9':   { label: '6 in × 9 in',                 wIn: 6,  lIn: 9 },
  '12x12': { label: '12 in × 12 in',               wIn: 12, lIn: 12 },
  '16x16': { label: '16 in × 16 in',               wIn: 16, lIn: 16 },
  '24x24': { label: '24 in × 24 in',               wIn: 24, lIn: 24 },
};

// --- Paver materials ---------------------------------------------------------
export const GRAVEL_COMPACTION = 1.10;     // order 10% extra: crushed base compacts when tamped
export const GRAVEL_TONS_PER_CUYD = 1.4;   // crushed stone ≈ 1.4 tons per cubic yard
export const BASE_BAG_CUFT = 0.5;          // paver base gravel bag size
export const SAND_BAG_CUFT = 0.5;          // leveling/paver sand bag size
export const POLY_SAND_SQFT_PER_BAG = 65;  // 50 lb bag; 50–75 sq ft for standard joints, more for large-format pavers
export const FABRIC_WASTE = 1.10;          // overlap seams by ~10%
export const FABRIC_ROLL_SQFT = 150;       // 3 ft × 50 ft roll
export const EDGING_SECTION_FT = 6;        // paver edging sold in 6 ft sections
export const SPIKE_SPACING_FT = 2;         // 1 spike per ~2 ft (use more on curves)
export const SPIKES_PER_PACK = 10;

// --- Grass: seed rates for NEW lawns, lb per 1000 sq ft ----------------------
export const GRASS_TYPES = {
  kbg:           { label: 'Kentucky bluegrass',  ratePer1000: 3 },
  tall_fescue:   { label: 'Tall fescue',         ratePer1000: 9 },
  perennial_rye: { label: 'Perennial ryegrass',  ratePer1000: 8 },
  fine_fescue:   { label: 'Fine fescue',         ratePer1000: 5 },
  bermuda:       { label: 'Bermuda',             ratePer1000: 2 },
  sun_shade_mix: { label: 'Sun & shade mix',     ratePer1000: 6 },
};

// --- Grass materials ----------------------------------------------------------
export const SOD_WASTE = 1.05;             // 5% extra for cuts along edges
export const SOD_PALLET_SQFT = 450;        // typical pallet coverage (400–500 by region)
export const SOD_ROLL_SQFT = 10;           // standard 2 ft × 5 ft roll
export const TOPSOIL_BAG_CUFT = 0.75;      // ≈ 40 lb bag
export const FERT_SQFT_PER_BAG = 5000;     // typical starter fertilizer bag coverage
export const STRAW_SQFT_PER_BALE = 500;    // light seed cover
export const PEAT_SQFT_PER_BALE = 385;     // 3.8 cu ft compressed bale ≈ 8 cu ft expanded at 1/4 in cover

// --- Mulch ---------------------------------------------------------------------
export const MULCH_BAG_CUFT = 2;           // standard mulch bag
export const MULCH_TYPES = {
  hardwood: { label: 'Hardwood (brown)', query: 'hardwood mulch 2 cu ft' },
  black:    { label: 'Black',            query: 'black mulch 2 cu ft' },
  red:      { label: 'Red',              query: 'red mulch 2 cu ft' },
  cedar:    { label: 'Cedar',            query: 'cedar mulch bag' },
};

// --- Gravel (paths, pads, driveways) ---------------------------------------------
export const GRAVEL_BAG_CUFT = 0.5;
export const GRAVEL_TYPES = {
  crushed: { label: 'Crushed stone (packs firm)', query: 'crushed stone bag', compaction: 1.10 },
  pea:     { label: 'Pea gravel',                 query: 'pea gravel bag',    compaction: 1.0 },
  river:   { label: 'River rock',                 query: 'river rock bag',    compaction: 1.0 },
};

// --- Concrete slab -----------------------------------------------------------------
export const CONCRETE_BAG80_YIELD_CUFT = 0.60; // one 80 lb bag of concrete mix
export const CONCRETE_WASTE = 1.10;            // spillage + uneven subgrade
export const REMESH_SHEET_SQFT = 22;           // 42in × 84in sheet ≈ 24.5 sq ft, minus overlap
export const FORM_BOARD_FT = 8;                // 2×4×8 form boards
export const READY_MIX_MIN_CUYD = 1;           // at ≥ 1 cu yd, get a ready-mix truck quote

// --- Fence ----------------------------------------------------------------------------
export const GATE_OPENING_FT = 4;          // assumed opening per gate
export const POST_CONCRETE_BAGS = 2;       // 50 lb fast-setting bags per post (24 in hole)
export const PICKET_FACE_IN = 6;           // 5.5 in picket + 1/2 in gap = one picket per 6 in
export const FENCE_STYLES = {
  panels: { label: 'Privacy panels (pre-built)' },
  picket: { label: 'Picket (build from parts)' },
  rail:   { label: 'Split rail (2-rail)' },
};

// --- Trees & bushes ----------------------------------------------------------------------
export const SOIL_BAGS_PER_PLANT = 1;      // 1 cu ft garden soil per shrub (2–3 for trees)

// --- Sprinklers -----------------------------------------------------------------------------
// sqftPerHead = effective coverage with proper head-to-head overlap, edge
// losses included. gpmPerHead drives how many heads fit on one zone.
export const SPRINKLER_TYPES = {
  rotor: { label: 'Rotor heads — in-ground, large lawns',        sqftPerHead: 750,  gpmPerHead: 3.0, spacingFt: 30 },
  spray: { label: 'Pop-up sprays — in-ground, small/medium',     sqftPerHead: 140,  gpmPerHead: 1.5, spacingFt: 13 },
  drip:  { label: 'Drip line — beds, borders, foundation plants' },
  hose:  { label: 'Hose-end sprinkler — no digging',             sqftPerUnit: 2500 },
};
export const DEFAULT_SUPPLY_GPM = 12;      // typical home spigot/service; user can measure & edit
export const PIPE_ROLL_FT = 100;           // poly pipe roll
export const MAINLINE_EXTRA_FT = 50;       // rough run from the valves to the lawn
export const LATERAL_FUDGE = 1.1;          // extra pipe for routing around things
export const DRIP_LINE_FT_PER_SQFT = 1.1;  // inline-emitter tubing on a ~12 in grid
export const DRIP_ROLL_FT = 100;
export const DRIP_STAKE_SPACING_FT = 2.5;
export const VALVES_PER_BOX = 3;

// --- Misc ---------------------------------------------------------------------
export const BULK_SUGGEST_CUYD = 1;        // at ≥ 1 cu yd, bulk delivery usually beats bags
export const HUGE_AREA_SQFT = 10000;       // above this, warn about a possible typo

// --- Default prices (USD). Users override these in Settings; overrides win.
// `group` controls the section headers on the Settings screen.
export const DEFAULT_PRICES = {
  // Pavers
  paver_4x8:        { group: 'Pavers', label: '4×8 paver (each)',                 price: 0.75 },
  paver_6x6:        { group: 'Pavers', label: '6×6 paver (each)',                 price: 1.25 },
  paver_6x9:        { group: 'Pavers', label: '6×9 paver (each)',                 price: 1.75 },
  paver_12x12:      { group: 'Pavers', label: '12×12 paver (each)',               price: 2.00 },
  paver_16x16:      { group: 'Pavers', label: '16×16 paver (each)',               price: 4.50 },
  paver_24x24:      { group: 'Pavers', label: '24×24 paver (each)',               price: 9.00 },
  paver_custom:     { group: 'Pavers', label: 'Custom paver (each)',              price: 3.00 },
  paver_base_bag:   { group: 'Pavers', label: 'Paver base, 0.5 cu ft bag',        price: 4.50 },
  leveling_sand_bag:{ group: 'Pavers', label: 'Leveling sand, 0.5 cu ft bag',     price: 4.50 },
  poly_sand_bag:    { group: 'Pavers', label: 'Polymeric sand, 50 lb bag',        price: 25.00 },
  edging_section:   { group: 'Pavers', label: 'Paver edging, 6 ft section',       price: 12.00 },
  spikes_10pk:      { group: 'Pavers', label: 'Edging spikes, 10-pack',           price: 10.00 },
  // Grass
  seed_per_lb:      { group: 'Grass', label: 'Grass seed (per lb)',               price: 4.00 },
  sod_pallet:       { group: 'Grass', label: 'Sod (per 450 sq ft pallet)',        price: 200.00 },
  starter_fert_bag: { group: 'Grass', label: 'Starter fertilizer bag',            price: 25.00 },
  straw_bale:       { group: 'Grass', label: 'Straw bale',                        price: 10.00 },
  peat_bale:        { group: 'Grass', label: 'Peat moss bale',                    price: 15.00 },
  // Soil & fabric (shared)
  topsoil_bag:      { group: 'Soil & fabric', label: 'Topsoil, 0.75 cu ft bag',   price: 3.00 },
  garden_soil_bag:  { group: 'Soil & fabric', label: 'Garden soil, 1 cu ft bag',  price: 8.00 },
  fabric_roll:      { group: 'Soil & fabric', label: 'Landscape fabric, 3×50 ft roll', price: 20.00 },
  // Mulch & gravel
  mulch_bag:        { group: 'Mulch & gravel', label: 'Mulch, 2 cu ft bag',       price: 4.50 },
  gravel_bag:       { group: 'Mulch & gravel', label: 'Gravel/rock, 0.5 cu ft bag', price: 5.00 },
  // Concrete
  concrete_80lb:    { group: 'Concrete', label: 'Concrete mix, 80 lb bag',        price: 6.50 },
  remesh_sheet:     { group: 'Concrete', label: 'Remesh sheet, 42×84 in',         price: 13.00 },
  form_board:       { group: 'Concrete', label: 'Form board, 2×4×8 ft',           price: 5.50 },
  // Fence
  fence_post:       { group: 'Fence', label: 'Post, 4×4×8 ft treated',            price: 17.00 },
  fence_panel:      { group: 'Fence', label: 'Privacy panel, 6×8 ft',             price: 65.00 },
  fence_picket:     { group: 'Fence', label: 'Picket (each)',                     price: 2.50 },
  fence_rail:       { group: 'Fence', label: 'Rail, 2×4×8 ft treated',            price: 9.00 },
  split_rail:       { group: 'Fence', label: 'Split rail (each)',                 price: 22.00 },
  post_concrete_bag:{ group: 'Fence', label: 'Fast-set concrete, 50 lb bag',      price: 6.50 },
  gate_kit:         { group: 'Fence', label: 'Gate kit / hardware',               price: 35.00 },
  // Trees & bushes
  plant_each:       { group: 'Trees & bushes', label: 'Plant (each, average)',    price: 40.00 },
  // Sprinklers
  rotor_head:       { group: 'Sprinklers', label: 'Rotor head (each)',            price: 18.00 },
  spray_head:       { group: 'Sprinklers', label: 'Pop-up spray head (each)',     price: 6.00 },
  poly_pipe_roll:   { group: 'Sprinklers', label: 'Poly pipe, 100 ft roll',       price: 35.00 },
  swing_kit:        { group: 'Sprinklers', label: 'Swing pipe kit (per head)',    price: 6.00 },
  zone_valve:       { group: 'Sprinklers', label: 'Zone valve (each)',            price: 18.00 },
  valve_box:        { group: 'Sprinklers', label: 'Valve box',                    price: 25.00 },
  controller:       { group: 'Sprinklers', label: 'Sprinkler controller/timer',   price: 80.00 },
  backflow:         { group: 'Sprinklers', label: 'Backflow preventer',           price: 30.00 },
  wire_roll:        { group: 'Sprinklers', label: 'Irrigation wire, 100 ft',      price: 25.00 },
  drip_tubing_roll: { group: 'Sprinklers', label: 'Drip emitter tubing, 100 ft',  price: 25.00 },
  drip_stakes_10pk: { group: 'Sprinklers', label: 'Drip tubing stakes, 10-pack',  price: 6.00 },
  drip_faucet_kit:  { group: 'Sprinklers', label: 'Drip faucet kit (filter + regulator)', price: 25.00 },
  hose_timer:       { group: 'Sprinklers', label: 'Hose faucet timer',            price: 30.00 },
  hose_sprinkler:   { group: 'Sprinklers', label: 'Hose-end sprinkler',           price: 25.00 },
  garden_hose:      { group: 'Sprinklers', label: 'Garden hose, 50 ft',           price: 30.00 },
};

// Merge user price overrides onto defaults → { key: number }
export function getPrices(overrides = {}) {
  const out = {};
  for (const key of Object.keys(DEFAULT_PRICES)) {
    const o = overrides[key];
    out[key] = (typeof o === 'number' && isFinite(o) && o >= 0) ? o : DEFAULT_PRICES[key].price;
  }
  return out;
}
