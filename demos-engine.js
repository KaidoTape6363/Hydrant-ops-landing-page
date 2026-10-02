/**
 * Shared DOM helpers + three independent demo instances (Field View,
 * Rota IC, Station OIC). Each call to mountDemo() creates its own
 * isolated state and render loop scoped to one container — so three
 * demos can live on the same page without sharing or clobbering state.
 */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function demoLabel(text, style) {
  const p = el('p', null, text);
  p.style.cssText = `margin:0;font-size:12px;color:#8b97ab;${style || ''}`;
  return p;
}

function demoBtn(text, onClick, primary) {
  const b = el('button', null, text);
  b.style.cssText = `
    height:40px;border-radius:7px;border:1px solid ${primary ? '#dc2626' : '#273449'};
    background:${primary ? '#dc2626' : 'transparent'};color:#f8fafc;font-weight:600;font-size:13px;
    font-family:Inter,sans-serif;cursor:pointer;width:100%;
  `;
  b.addEventListener('click', onClick);
  return b;
}

function demoSelectBox(value, placeholder, onClick) {
  const d = el('button', null, `<span>${value || placeholder}</span>`);
  d.style.cssText = `
    height:42px;border-radius:7px;border:1px solid #273449;background:#020617;color:${value ? '#f8fafc' : '#596579'};
    font-size:13px;font-family:Inter,sans-serif;text-align:left;padding:0 12px;cursor:pointer;width:100%;
  `;
  d.addEventListener('click', onClick);
  return d;
}

function demoScreenWrap(screen, children) {
  screen.innerHTML = '';
  const box = el('div');
  box.style.cssText = 'display:flex;flex-direction:column;gap:12px;height:100%;';
  children.forEach((c) => box.appendChild(c));
  screen.appendChild(box);
}

/* ======================================================================
   DEMO 1 — Field View (Section Commander)
   ====================================================================== */
function mountFieldViewDemo(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const screen = root.querySelector('.demo-screen');
  const titleEl = root.querySelector('.demo-step-title');
  const textEl = root.querySelector('.demo-step-text');
  const restartBtn = root.querySelector('.demo-restart');

  const state = { station: '', rota: '', pin: '', unlocked: false, hydrantOpen: false, defectSelected: false, photo1: false, photo2: false, completed: false };

  function setNarrative(t, x) { titleEl.textContent = t; textEl.textContent = x; }

  function render() {
    if (!state.station || !state.rota) return renderSelect();
    if (!state.unlocked) return renderPin();
    if (!state.hydrantOpen) return renderDutyList();
    return renderDrawer();
  }

  function renderSelect() {
    setNarrative('Step 1 — Unlock the duty', 'Pick a station and rota, just like a real Section Commander would at the start of a shift.');
    const title = el('h4', null, 'Section Commander');
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:17px;color:#f8fafc;margin:4px 0 2px;';
    const sub = demoLabel('Pick your Station and Rota to continue.');
    const stationBtn = demoSelectBox(state.station, '— Select Station —', () => { state.station = 'STN44'; render(); });
    const rotaBtn = demoSelectBox(state.rota, '— Select Rota —', () => { if (!state.station) return; state.rota = 'ROTA 2'; render(); });
    if (!state.station) rotaBtn.style.opacity = '0.5';
    const cont = demoBtn('Continue', () => { if (state.station && state.rota) render(); }, true);
    cont.disabled = !(state.station && state.rota);
    if (cont.disabled) cont.style.opacity = '0.5';
    demoScreenWrap(screen, [title, sub, demoLabel('Station', 'margin-top:8px;'), stationBtn, demoLabel('Rota'), rotaBtn, cont]);
  }

  function renderPin() {
    setNarrative('Step 2 — Enter the duty PIN', 'The real PIN is set per Rota by the IC. This demo uses a fixed sample PIN: 6767.');
    const title = el('h4', null, 'Enter the duty PIN');
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:17px;color:#f8fafc;margin:4px 0 2px;text-align:center;';
    const sub = demoLabel(`${state.station} — ${state.rota}`, 'text-align:center;margin-bottom:6px;');
    const pinDisplay = el('div', null, state.pin.padEnd(4, '•').split('').join(' '));
    pinDisplay.style.cssText = 'text-align:center;font-family:JetBrains Mono,monospace;font-size:26px;letter-spacing:4px;color:#f8fafc;background:#020617;border:1.5px solid #dc2626;border-radius:8px;padding:14px;margin:6px 0;';
    const keypad = el('div');
    keypad.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;';
    ['1','2','3','4','5','6','7','8','9','⌫','0','OK'].forEach((k) => {
      const b = el('button', null, k);
      b.style.cssText = 'height:40px;border-radius:7px;border:1px solid #273449;background:#0f172a;color:#f8fafc;font-size:14px;font-family:JetBrains Mono,monospace;cursor:pointer;';
      b.addEventListener('click', () => {
        if (k === '⌫') state.pin = state.pin.slice(0, -1);
        else if (k === 'OK') {
          if (state.pin === '6767') { state.unlocked = true; render(); return; }
          state.pin = ''; render(); setNarrative('Wrong PIN', "Try 6767 — that's this demo's fixed sample PIN."); return;
        } else if (state.pin.length < 4) state.pin += k;
        render();
      });
      keypad.appendChild(b);
    });
    demoScreenWrap(screen, [title, sub, pinDisplay, keypad]);
  }

  const SAMPLE = { hydrantNo: 'DPH21519', address: 'Choa Chu Kang Avenue 7', appliance: 'LF441' };

  function renderDutyList() {
    setNarrative("Step 3 — Today's duty", 'One sample hydrant is assigned for this demo. Tap it to open the inspection.');
    const title = el('h4', null, "Today's duty");
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:17px;color:#f8fafc;margin:4px 0 2px;';
    const sub = demoLabel(`${state.station} — ${state.rota}`);
    const tab = el('div', null, SAMPLE.appliance);
    tab.style.cssText = 'display:inline-block;background:#dc2626;color:#f8fafc;font-size:11px;font-weight:700;padding:5px 12px;border-radius:7px;margin:6px 0 10px;';
    const card = el('div');
    card.style.cssText = 'border:1px solid #273449;border-radius:9px;background:#0f172a;padding:12px;cursor:pointer;';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:6px;height:6px;border-radius:50%;background:#dc2626;"></span>
        <strong style="font-family:Oswald,sans-serif;font-size:14px;color:#f8fafc;">${SAMPLE.hydrantNo}</strong>
      </div>
      <p style="margin:4px 0 0;font-size:12px;color:#8b97ab;">${SAMPLE.address}</p>
      <span style="display:inline-block;margin-top:6px;font-size:10px;background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:9px;">Pending</span>
    `;
    card.addEventListener('click', () => { state.hydrantOpen = true; render(); });
    demoScreenWrap(screen, [title, sub, tab, card]);
  }

  function renderDrawer() {
    const allPhotos = state.photo1 && state.photo2;
    const canComplete = !state.defectSelected || allPhotos;
    if (!state.defectSelected) setNarrative('Step 4 — Log a defect', 'Select a defect to see the photo requirement appear.');
    else if (!allPhotos) setNarrative('Step 5 — Attach 2 photos', 'Both photo slots are required before this can be saved — tap each one to simulate attaching a photo.');
    else setNarrative('Step 6 — Mark it complete', 'Both photos are in. The hydrant can now be marked tested.');

    const back = el('button', null, '← Back');
    back.style.cssText = 'background:none;border:none;color:#8b97ab;font-size:12px;cursor:pointer;padding:0;text-align:left;';
    back.addEventListener('click', () => { state.hydrantOpen = false; render(); });
    const title = el('h4', null, SAMPLE.hydrantNo);
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:18px;color:#f8fafc;margin:6px 0 0;';
    const addr = demoLabel(SAMPLE.address);

    const toggleRow = el('div');
    toggleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;border:1px solid #273449;border-radius:8px;background:#020617;padding:10px 12px;margin-top:6px;';
    toggleRow.innerHTML = `<span style="font-size:12.5px;color:#e2e8f0;">Inspection completed</span>`;
    const dot = el('div');
    dot.style.cssText = `width:36px;height:20px;border-radius:10px;background:${state.completed ? '#dc2626' : '#1e293b'};position:relative;cursor:${canComplete ? 'pointer' : 'not-allowed'};opacity:${canComplete ? '1' : '0.5'};`;
    dot.innerHTML = `<span style="position:absolute;top:2px;left:${state.completed ? '18px' : '2px'};width:16px;height:16px;border-radius:50%;background:#f8fafc;transition:left .15s;"></span>`;
    dot.addEventListener('click', () => { if (canComplete) { state.completed = !state.completed; render(); } });
    toggleRow.appendChild(dot);

    const defectLabel = demoLabel('Defect', 'margin-top:8px;');
    const defectPill = el('button', null, state.defectSelected ? 'Spindle head unable to fit hydrant key' : 'No defect selected');
    defectPill.style.cssText = `width:100%;text-align:left;height:38px;border-radius:7px;border:1px solid #273449;background:#020617;color:${state.defectSelected ? '#f8fafc' : '#596579'};font-size:12px;padding:0 10px;cursor:pointer;`;
    defectPill.addEventListener('click', () => { state.defectSelected = !state.defectSelected; if (!state.defectSelected) { state.photo1 = false; state.photo2 = false; } render(); });

    const children = [back, title, addr, toggleRow, defectLabel, defectPill];
    if (state.defectSelected) {
      const photoLabel = demoLabel('Attach 2 photos for this hydrant *', 'margin-top:4px;color:#fbbf24;');
      const photoRow = el('div');
      photoRow.style.cssText = 'display:flex;gap:8px;';
      [1, 2].forEach((n) => {
        const filled = n === 1 ? state.photo1 : state.photo2;
        const slot = el('button', null, filled ? '✓ Photo ' + n : '+ Photo ' + n);
        slot.style.cssText = `flex:1;height:60px;border-radius:7px;border:1px dashed ${filled ? '#334155' : '#273449'};background:${filled ? '#1c1207' : '#020617'};color:${filled ? '#4ade80' : '#596579'};font-size:11px;cursor:pointer;`;
        slot.addEventListener('click', () => { if (n === 1) state.photo1 = !state.photo1; else state.photo2 = !state.photo2; render(); });
        photoRow.appendChild(slot);
      });
      children.push(photoLabel, photoRow);
      if (!allPhotos) children.push(demoLabel('Both photos are required before this can be saved.', 'color:#fbbf24;margin-top:2px;'));
    }
    if (state.completed) {
      const done = el('div', null, '✓ Marked complete — nice work.');
      done.style.cssText = 'margin-top:10px;background:#052e16;color:#4ade80;font-size:12px;padding:8px 10px;border-radius:7px;text-align:center;';
      children.push(done);
    }
    demoScreenWrap(screen, children);
  }

  restartBtn.addEventListener('click', () => {
    Object.assign(state, { station: '', rota: '', pin: '', unlocked: false, hydrantOpen: false, defectSelected: false, photo1: false, photo2: false, completed: false });
    render();
  });
  render();
}

/* ======================================================================
   DEMO 2 — Rota IC: Master Schedule, collapsible Filters, Overdue
   ====================================================================== */
function mountRotaICDemo(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const screen = root.querySelector('.demo-screen');
  const titleEl = root.querySelector('.demo-step-title');
  const textEl = root.querySelector('.demo-step-text');
  const restartBtn = root.querySelector('.demo-restart');

  const HYDRANTS = [
    { no: 'DPH21519', address: 'Choa Chu Kang Ave 7', scope: 'current', overdue: false, scheduledDate: '' },
    { no: 'DPH20506', address: 'Choa Chu Kang Ave 5', scope: 'current', overdue: false, scheduledDate: '' },
    { no: 'DPH16921', address: 'Senja Road',           scope: 'overdue', overdue: true, scheduledDate: '' },
    { no: 'DPH16922', address: 'Senja Road',           scope: 'overdue', overdue: true, scheduledDate: '' },
  ];

  const state = { filtersOpen: false, scope: 'current', assignedDate: {} };

  function setNarrative(t, x) { titleEl.textContent = t; textEl.textContent = x; }

  // Deliberately counts ALL overdue hydrants, even ones already assigned
  // a date — matching the real app's rule exactly: scheduling a hydrant
  // does NOT clear it from Overdue, only marking it completed does. This
  // demo doesn't include the full completion step, so the badge count
  // intentionally never drops to demonstrate that rule, not despite it.
  function overdueCount() { return HYDRANTS.filter((h) => h.overdue).length; }

  function render() {
    const visible = HYDRANTS.filter((h) => (state.scope === 'overdue' ? h.overdue : h.scope === 'current'));

    if (!state.filtersOpen) setNarrative('Step 1 — Filters, collapsed by default', 'Tap "Filters" to reveal This month / All hydrants / Overdue, plus status and search — all tucked behind one toggle instead of stacked blocks.');
    else if (state.scope === 'current') setNarrative('Step 2 — Switch to Overdue', 'Tap "Overdue" to see hydrants whose target month has already passed and still aren\'t complete.');
    else setNarrative('Step 3 — Assigning doesn\'t clear it', 'Assign a date to an overdue hydrant and notice the Overdue count doesn\'t drop — in the real app, only marking it completed clears the flag.');

    const header = el('h4', null, 'Master Schedule');
    header.style.cssText = 'font-family:Oswald,sans-serif;font-size:16px;color:#f8fafc;margin:0;';
    const sub = demoLabel('STN44 — ROTA 2 — LF441');

    const filterBar = el('button');
    const od = overdueCount();
    filterBar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;border:1px solid #273449;border-radius:8px;background:#0f172a;padding:10px 12px;cursor:pointer;';
    filterBar.innerHTML = `
      <span style="font-size:12.5px;color:#e2e8f0;font-weight:600;">Filters <span style="color:#596579;font-weight:400;">${state.scope === 'overdue' ? 'Overdue' : 'This month'}</span></span>
      ${od > 0 ? `<span style="background:#450a0a;color:#f87171;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:9px;">${od} overdue</span>` : ''}
    `;
    filterBar.addEventListener('click', () => { state.filtersOpen = !state.filtersOpen; render(); });

    const children = [header, sub, filterBar];

    if (state.filtersOpen) {
      const scopeRow = el('div');
      scopeRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;border:1px solid #273449;border-radius:8px;background:#020617;padding:4px;';
      ['current', 'overdue'].forEach((s) => {
        const b = el('button', null, s === 'current' ? 'This month' : `Overdue${od > 0 ? ` (${od})` : ''}`);
        b.style.cssText = `height:34px;border-radius:6px;border:none;font-size:11.5px;font-weight:600;cursor:pointer;background:${state.scope === s ? '#dc2626' : 'transparent'};color:${state.scope === s ? '#fff' : '#8b97ab'};`;
        b.addEventListener('click', () => { state.scope = s; render(); });
        scopeRow.appendChild(b);
      });
      children.push(scopeRow);
    }

    const list = el('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:7px;margin-top:2px;';
    visible.forEach((h) => {
      const row = el('div');
      const assigned = state.assignedDate[h.no];
      row.style.cssText = `border:1px solid ${h.overdue ? '#7f1d1d' : '#273449'};border-radius:8px;background:${h.overdue ? '#1c0a0a' : '#0f172a'};padding:9px 10px;`;
      row.innerHTML = `
        <strong style="font-family:Oswald,sans-serif;font-size:12.5px;color:#f8fafc;">${h.no}</strong>
        <p style="margin:2px 0 6px;font-size:11px;color:#8b97ab;">${h.address}</p>
      `;
      if (h.overdue) {
        const assignBtn = el('button', null, assigned ? `✓ Scheduled ${assigned}` : 'Assign date');
        assignBtn.style.cssText = `width:100%;height:30px;border-radius:6px;border:1px solid ${assigned ? '#166534' : '#273449'};background:${assigned ? '#052e16' : '#020617'};color:${assigned ? '#4ade80' : '#8b97ab'};font-size:11px;cursor:pointer;`;
        assignBtn.disabled = !!assigned;
        assignBtn.addEventListener('click', () => { state.assignedDate[h.no] = '17 Oct'; render(); });
        row.appendChild(assignBtn);
      }
      list.appendChild(row);
    });
    children.push(list);

    demoScreenWrap(screen, children);
  }

  restartBtn.addEventListener('click', () => {
    state.filtersOpen = false; state.scope = 'current'; state.assignedDate = {};
    render();
  });
  render();
}

/* ======================================================================
   DEMO 3 — Station OIC: clickable KPI cards open a filtered list
   ====================================================================== */
function mountOICDemo(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const screen = root.querySelector('.demo-screen');
  const titleEl = root.querySelector('.demo-step-title');
  const textEl = root.querySelector('.demo-step-text');
  const restartBtn = root.querySelector('.demo-restart');

  const LISTS = {
    pending: [
      { no: 'DPH21519', address: 'Choa Chu Kang Ave 7' },
      { no: 'DPH20506', address: 'Choa Chu Kang Ave 5' },
    ],
    overdue: [
      { no: 'DPH16921', address: 'Senja Road' },
    ],
    defects: [
      { no: 'DPH21876', address: 'Choa Chu Kang Ave 5' },
    ],
  };
  const KPIS = [
    { key: 'tested', label: 'Hydrants tested', value: '142 / 420', clickable: false, accent: '#f8fafc' },
    { key: 'pending', label: 'Pending', value: String(LISTS.pending.length), clickable: true, accent: '#f8fafc' },
    { key: 'overdue', label: 'Overdue', value: String(LISTS.overdue.length), clickable: true, accent: '#f87171' },
    { key: 'defects', label: 'Open defects', value: String(LISTS.defects.length), clickable: true, accent: '#fbbf24' },
  ];

  const state = { openList: null };

  function setNarrative(t, x) { titleEl.textContent = t; textEl.textContent = x; }

  function render() {
    if (!state.openList) setNarrative('Step 1 — Tap a KPI', 'Pending, Overdue, and Open defects are clickable — each opens the exact filtered list behind that number.');
    else setNarrative('Step 2 — The filtered list', `Showing: ${state.openList[0].toUpperCase()}${state.openList.slice(1)}. This is the real Hydrant Directory, pre-scoped — not a separate screen.`);

    if (state.openList) return renderList();

    const header = el('h4', null, 'ROTA 2 dashboard');
    header.style.cssText = 'font-family:Oswald,sans-serif;font-size:16px;color:#f8fafc;margin:0;';
    const sub = demoLabel('Station-wide — Overview');

    const grid = el('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:4px;';
    KPIS.forEach((k) => {
      const card = el('button');
      card.style.cssText = `text-align:left;border:1px solid #273449;border-radius:9px;background:#0f172a;padding:12px;cursor:${k.clickable ? 'pointer' : 'default'};`;
      card.innerHTML = `
        <div style="font-family:Oswald,sans-serif;font-size:20px;color:${k.accent};">${k.value}</div>
        <div style="font-size:10.5px;color:#8b97ab;margin-top:2px;">${k.label}${k.clickable ? ' · tap to view' : ''}</div>
      `;
      if (k.clickable) card.addEventListener('click', () => { state.openList = k.key; render(); });
      grid.appendChild(card);
    });

    demoScreenWrap(screen, [header, sub, grid]);
  }

  function renderList() {
    const back = el('button', null, '← Back to Overview');
    back.style.cssText = 'background:none;border:none;color:#8b97ab;font-size:12px;cursor:pointer;padding:0;text-align:left;';
    back.addEventListener('click', () => { state.openList = null; render(); });

    const title = el('h4', null, 'Hydrant Directory');
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:16px;color:#f8fafc;margin:4px 0 0;';
    const scopeLabel = el('p', null, `Showing: ${state.openList[0].toUpperCase()}${state.openList.slice(1)}`);
    scopeLabel.style.cssText = 'margin:0;font-size:11px;color:#fbbf24;';

    const list = el('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:7px;margin-top:6px;';
    LISTS[state.openList].forEach((h) => {
      const row = el('div');
      row.style.cssText = 'border:1px solid #273449;border-radius:8px;background:#0f172a;padding:9px 10px;';
      row.innerHTML = `<strong style="font-family:Oswald,sans-serif;font-size:12.5px;color:#f8fafc;">${h.no}</strong><p style="margin:2px 0 0;font-size:11px;color:#8b97ab;">${h.address}</p>`;
      list.appendChild(row);
    });

    demoScreenWrap(screen, [back, title, scopeLabel, list]);
  }

  restartBtn.addEventListener('click', () => { state.openList = null; render(); });
  render();
}
