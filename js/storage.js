// localStorage persistence with an in-memory fallback (Safari private mode,
// storage full, etc.). All reads are guarded — corrupt JSON falls back to
// defaults instead of breaking the app.

const KEYS = {
  projects: 'yardcalc.projects.v1',
  settings: 'yardcalc.settings.v1',
  active: 'yardcalc.activeProjectId',
};

const memory = {}; // fallback store

export const storageAvailable = (() => {
  try {
    const t = '__yardcalc_test__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
})();

function read(key, fallback) {
  try {
    const raw = storageAvailable ? localStorage.getItem(key) : memory[key];
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  const raw = JSON.stringify(value);
  try {
    if (storageAvailable) localStorage.setItem(key, raw);
    else memory[key] = raw;
  } catch {
    memory[key] = raw; // storage full — keep working in memory
  }
}

export function makeId() {
  return (crypto.randomUUID?.() ?? 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2));
}

// Keys of the per-calculator option blocks on a project.
export const CALC_KEYS = ['paver', 'grass', 'mulch', 'gravel', 'concrete', 'fence', 'plants', 'sprinkler'];

export function defaultProject(name = 'My backyard') {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    name,
    createdAt: now,
    updatedAt: now,
    shapes: [],
    paver: {
      enabled: false,
      preset: '12x12',
      customWIn: 12,
      customLIn: 12,
      gravelDepthIn: 4,
      sandDepthIn: 1,
      wastePct: 10,
      edgingOverrideFt: null,
      edgingExcludeFt: 0,
    },
    grass: {
      enabled: false,
      mode: 'seed',
      grassType: 'sun_shade_mix',
      topsoilDepthIn: 3,
      seedCover: 'straw',
    },
    mulch: { enabled: false, type: 'hardwood', depthIn: 3, fabric: true },
    gravel: { enabled: false, type: 'crushed', depthIn: 3, fabric: true },
    concrete: { enabled: false, thicknessIn: 4, base: true, mesh: true, forms: true },
    fence: { enabled: false, lengthFt: null, spacingFt: 8, style: 'panels', gates: 1, railsPerSection: 2 },
    plants: { enabled: false, layout: 'grid', spacingFt: 3, rowLengthFt: null, soilBags: true },
    sprinkler: { enabled: false, type: 'rotor', supplyGpm: 12 },
    toolsChecked: {},
  };
}

// Fill in anything missing on projects saved by older app versions,
// keeping every value the user already set.
function ensureProjectDefaults(p) {
  const d = defaultProject();
  const merged = { ...d, ...p };
  for (const key of CALC_KEYS) {
    merged[key] = { ...d[key], ...(p?.[key] ?? {}) };
  }
  merged.shapes = Array.isArray(p?.shapes) ? p.shapes : [];
  merged.toolsChecked = (p?.toolsChecked && typeof p.toolsChecked === 'object') ? p.toolsChecked : {};
  return merged;
}

export function defaultSettings() {
  return { schemaVersion: 1, showMenards: false, prices: {} };
}

export function loadProjects() {
  const list = read(KEYS.projects, null);
  if (!Array.isArray(list) || !list.length) return [defaultProject()];
  return list.map(ensureProjectDefaults);
}

export function saveProjects(projects) {
  write(KEYS.projects, projects);
}

export function loadSettings() {
  const s = read(KEYS.settings, null);
  return (s && typeof s === 'object') ? { ...defaultSettings(), ...s } : defaultSettings();
}

export function saveSettings(settings) {
  write(KEYS.settings, settings);
}

export function loadActiveId() {
  return read(KEYS.active, null);
}

export function saveActiveId(id) {
  write(KEYS.active, id);
}
