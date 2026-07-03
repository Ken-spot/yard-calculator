// App bootstrap: state, tab routing, persistence wiring, service worker.

import {
  loadProjects, saveProjects, loadSettings, saveSettings,
  loadActiveId, saveActiveId, defaultProject, storageAvailable,
} from './storage.js';
import { summarizeShapes } from './engine/geometry.js';
import { fmtSqFt } from './format.js';
import { el } from './ui/dom.js';
import { renderAreaTab } from './ui/shapes-ui.js';
import { renderBuildTab } from './ui/build-ui.js';
import { renderListTab } from './ui/materials-ui.js';
import { renderSettingsTab } from './ui/settings-ui.js';

// --- state -------------------------------------------------------------------
const state = {
  projects: loadProjects(),
  settings: loadSettings(),
  activeId: loadActiveId(),
};
if (!state.projects.find(p => p.id === state.activeId)) {
  state.activeId = state.projects[0].id;
}

let currentTab = 'area';

const TABS = {
  area: renderAreaTab,
  build: renderBuildTab,
  list: renderListTab,
  settings: renderSettingsTab,
};

// --- shared context passed to every UI module --------------------------------
const ctx = {
  state,
  uiState: { projectsOpen: false }, // transient, not persisted
  get project() {
    return state.projects.find(p => p.id === state.activeId) ?? state.projects[0];
  },
  get settings() {
    return state.settings;
  },
  save() {
    this.project.updatedAt = new Date().toISOString();
    saveProjects(state.projects);
    saveSettings(state.settings);
    saveActiveId(state.activeId);
    this.updateChip();
  },
  updateChip() {
    const sum = summarizeShapes(this.project.shapes);
    document.getElementById('area-chip').textContent = fmtSqFt(sum.netSqFt) + ' sq ft';
  },
  rerender() {
    renderTab(currentTab);
  },
  switchTab(name) {
    currentTab = name;
    for (const btn of document.querySelectorAll('#tabbar button')) {
      btn.classList.toggle('active', btn.dataset.tab === name);
    }
    for (const sec of document.querySelectorAll('main .tab')) {
      sec.hidden = sec.id !== 'tab-' + name;
    }
    renderTab(name);
    window.scrollTo(0, 0);
  },
};

function renderTab(name) {
  const section = document.getElementById('tab-' + name);
  TABS[name](section, ctx);
  ctx.updateChip();
}

// --- tab bar ------------------------------------------------------------------
document.getElementById('tabbar').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-tab]');
  if (btn) ctx.switchTab(btn.dataset.tab);
});

// --- storage warning ------------------------------------------------------------
if (!storageAvailable) {
  document.getElementById('banner').append(
    el('div', { class: 'warn' },
      'Saving is unavailable (private browsing?). The calculator works, but changes will be lost when you close the app.'));
}

// --- first paint -----------------------------------------------------------------
ctx.switchTab('area');

// --- service worker (offline support) ----------------------------------------------
// Skipped on localhost so local development always shows fresh files.
// Add ?sw=1 to the URL to test the service worker locally.
const isLocalDev = ['localhost', '127.0.0.1'].includes(location.hostname)
  && !new URLSearchParams(location.search).has('sw');
if ('serviceWorker' in navigator && !isLocalDev) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // Offline caching is a nice-to-have; the app works without it.
  });
}
