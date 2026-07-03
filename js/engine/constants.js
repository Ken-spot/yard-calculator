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

// --- Misc ---------------------------------------------------------------------
export const BULK_SUGGEST_CUYD = 1;        // at ≥ 1 cu yd, bulk delivery usually beats bags
export const HUGE_AREA_SQFT = 10000;       // above this, warn about a possible typo

// --- Default prices (USD). Users override these in Settings; overrides win. ---
export const DEFAULT_PRICES = {
  paver_4x8:        { label: '4×8 paver (each)',                 price: 0.75 },
  paver_6x6:        { label: '6×6 paver (each)',                 price: 1.25 },
  paver_6x9:        { label: '6×9 paver (each)',                 price: 1.75 },
  paver_12x12:      { label: '12×12 paver (each)',               price: 2.00 },
  paver_16x16:      { label: '16×16 paver (each)',               price: 4.50 },
  paver_24x24:      { label: '24×24 paver (each)',               price: 9.00 },
  paver_custom:     { label: 'Custom paver (each)',              price: 3.00 },
  paver_base_bag:   { label: 'Paver base, 0.5 cu ft bag',        price: 4.50 },
  leveling_sand_bag:{ label: 'Leveling sand, 0.5 cu ft bag',     price: 4.50 },
  poly_sand_bag:    { label: 'Polymeric sand, 50 lb bag',        price: 25.00 },
  fabric_roll:      { label: 'Landscape fabric, 3×50 ft roll',   price: 20.00 },
  edging_section:   { label: 'Paver edging, 6 ft section',       price: 12.00 },
  spikes_10pk:      { label: 'Edging spikes, 10-pack',           price: 10.00 },
  seed_per_lb:      { label: 'Grass seed (per lb)',              price: 4.00 },
  sod_pallet:       { label: 'Sod (per 450 sq ft pallet)',       price: 200.00 },
  topsoil_bag:      { label: 'Topsoil, 0.75 cu ft bag',          price: 3.00 },
  starter_fert_bag: { label: 'Starter fertilizer bag',           price: 25.00 },
  straw_bale:       { label: 'Straw bale',                       price: 10.00 },
  peat_bale:        { label: 'Peat moss bale',                   price: 15.00 },
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
