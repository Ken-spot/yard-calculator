// Project name + save/load panel, shown at the top of the Area tab.

import { el } from './dom.js';
import { defaultProject } from '../storage.js';

export function renderProjectsBar(root, ctx) {
  const nameInput = el('input', {
    type: 'text',
    value: ctx.project.name,
    placeholder: 'Project name',
    oninput: (e) => { ctx.project.name = e.target.value; ctx.save(); },
  });

  const toggleBtn = el('button', {
    class: 'btn',
    onclick: () => { ctx.uiState.projectsOpen = !ctx.uiState.projectsOpen; ctx.rerender(); },
  }, ctx.uiState.projectsOpen ? 'Close' : 'Projects');

  const bar = el('div', { class: 'card' },
    el('div', { class: 'row' },
      el('div', { class: 'field', style: 'flex:2; margin-bottom:0' },
        el('label', {}, 'Project'),
        nameInput),
      el('div', { class: 'field', style: 'flex:1; margin-bottom:0; display:flex; align-items:flex-end' },
        toggleBtn)),
  );
  root.append(bar);

  if (!ctx.uiState.projectsOpen) return;

  const panel = el('div', { class: 'card' }, el('h2', {}, 'Saved projects'));

  for (const p of ctx.state.projects) {
    const isActive = p.id === ctx.project.id;
    const open = el('button', {
      class: 'btn' + (isActive ? ' primary' : ''),
      onclick: () => {
        ctx.state.activeId = p.id;
        ctx.uiState.projectsOpen = false;
        ctx.save();
        ctx.rerender();
      },
    }, isActive ? 'Current' : 'Open');

    const del = el('button', {
      class: 'btn danger',
      onclick: () => {
        if (!confirm(`Delete "${p.name || 'Untitled'}"? This can't be undone.`)) return;
        ctx.state.projects = ctx.state.projects.filter(x => x.id !== p.id);
        if (!ctx.state.projects.length) ctx.state.projects.push(defaultProject('New project'));
        if (ctx.state.activeId === p.id) ctx.state.activeId = ctx.state.projects[0].id;
        ctx.save();
        ctx.rerender();
      },
    }, 'Delete');

    panel.append(el('div', { class: 'proj-row' },
      el('div', { class: 'name' },
        el('span', {}, p.name || 'Untitled'),
        el('span', { class: 'date' }, 'updated ' + new Date(p.updatedAt).toLocaleDateString())),
      open, del));
  }

  panel.append(el('button', {
    class: 'btn wide',
    style: 'margin-top:10px',
    onclick: () => {
      const p = defaultProject('New project');
      ctx.state.projects.push(p);
      ctx.state.activeId = p.id;
      ctx.uiState.projectsOpen = false;
      ctx.save();
      ctx.rerender();
    },
  }, '+ New project'));

  root.append(panel);
}
