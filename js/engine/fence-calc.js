// Fence materials. Length-based — does not use the project area.
// Pure function — no DOM, no storage.

import { FENCE_STYLES, GATE_OPENING_FT, POST_CONCRETE_BAGS, PICKET_FACE_IN } from './constants.js';

export const FENCE_TOOLS = [
  'Post-hole digger (or rent a power auger for 10+ posts)',
  'String line + stakes (straight runs)',
  '4 ft level (or a post level)',
  'Circular saw or miter saw',
  'Drill/driver + exterior screws',
  'Tape measure, work gloves, safety glasses',
];

export const FENCE_NOTES = [
  'Call 811 before digging — free utility line marking, usually within a few days.',
  'Set posts 1/3 of their height into the ground (2 ft deep for a 6 ft fence); below the frost line in cold climates.',
  'Check your property line and local fence height rules before you start.',
];

export function calcFenceMaterials({ options = {}, prices = {} }) {
  const lines = [];
  const warnings = [];

  const lengthFt = (isFinite(options.lengthFt) && options.lengthFt > 0) ? options.lengthFt : 0;
  if (lengthFt === 0) return { lines, tools: FENCE_TOOLS, notes: FENCE_NOTES, warnings };

  const line = (key, label, qty, unit, detail, searchQuery, priceKey = key) => {
    const unitPrice = prices[priceKey] ?? 0;
    lines.push({ key, label, qty, unit, detail, searchQuery, unitPrice, lineTotal: qty * unitPrice });
  };

  const style = FENCE_STYLES[options.style] ? options.style : 'panels';
  const spacingFt = (isFinite(options.spacingFt) && options.spacingFt > 0) ? options.spacingFt : 8;
  const gates = (isFinite(options.gates) && options.gates > 0) ? Math.floor(options.gates) : 0;

  const gateFt = gates * GATE_OPENING_FT;
  if (gateFt >= lengthFt) {
    warnings.push('The gates take up the whole fence length — check the total length or gate count.');
    return { lines, tools: FENCE_TOOLS, notes: FENCE_NOTES, warnings };
  }

  const fenceLen = lengthFt - gateFt;
  const sections = Math.ceil(fenceLen / spacingFt);
  const posts = sections + 1 + gates; // each gate opening adds one extra post

  line('fence_post', 'Posts (4×4×8 ft treated)', posts, 'posts',
    `${sections} sections at ${spacingFt} ft` + (gates ? ` + ${gates} gate opening${gates > 1 ? 's' : ''} (${GATE_OPENING_FT} ft each)` : ''),
    '4x4x8 pressure treated post');

  if (style === 'panels') {
    line('fence_panel', 'Privacy panels', sections, 'panels',
      `${spacingFt} ft panels — match panel width to your post spacing`, 'wood privacy fence panel');
  } else if (style === 'picket') {
    const railsPer = (isFinite(options.railsPerSection) && options.railsPerSection > 0) ? options.railsPerSection : 2;
    line('fence_rail', 'Rails (2×4×8 ft treated)', sections * railsPer, 'rails',
      `${railsPer} rails per section`, '2x4x8 pressure treated');
    const pickets = Math.ceil((fenceLen * 12) / PICKET_FACE_IN);
    line('fence_picket', 'Pickets', pickets, 'pickets',
      `5½ in pickets with ½ in gaps ≈ 2 per foot`, 'wood fence picket');
  } else if (style === 'rail') {
    line('split_rail', 'Split rails', sections * 2, 'rails',
      '2-rail style; use 3 per section for a 3-rail fence', 'split rail fence rail');
  }

  if (style !== 'rail') {
    line('post_concrete_bag', 'Fast-set concrete (50 lb bags)', posts * POST_CONCRETE_BAGS, 'bags',
      `${POST_CONCRETE_BAGS} bags per post (24 in hole)`, 'fast setting concrete 50 lb');
  } else {
    lines[lines.length - 1].detail += ' · split-rail posts are usually set with packed gravel, not concrete';
  }

  if (gates > 0) {
    line('gate_kit', 'Gate kits (hinges + latch)', gates, 'kits',
      `For ${GATE_OPENING_FT} ft openings — or buy pre-built gates`, 'fence gate hardware kit');
  }

  return { lines, tools: FENCE_TOOLS, notes: FENCE_NOTES, warnings };
}
