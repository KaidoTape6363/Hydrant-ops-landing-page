(function () {
  const screen = document.getElementById('demo-screen');
  const titleEl = document.getElementById('demo-step-title');
  const textEl = document.getElementById('demo-step-text');
  const restartBtn = document.getElementById('demo-restart');
  if (!screen) return;

  const state = {
    station: '',
    rota: '',
    pin: '',
    unlocked: false,
    hydrantOpen: false,
    defectSelected: false,
    photo1: false,
    photo2: false,
    completed: false,
  };

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function setNarrative(title, text) {
    titleEl.textContent = title;
    textEl.textContent = text;
  }

  function render() {
    screen.innerHTML = '';
    if (!state.station || !state.rota) return renderSelect();
    if (!state.unlocked) return renderPin();
    if (!state.hydrantOpen) return renderDutyList();
    return renderDrawer();
  }

  function screenWrap(children) {
    const box = el('div');
    box.style.cssText = 'display:flex;flex-direction:column;gap:12px;height:100%;';
    children.forEach((c) => box.appendChild(c));
    screen.appendChild(box);
  }

  function label(text, style) {
    const p = el('p', null, text);
    p.style.cssText = `margin:0;font-size:12px;color:#8b97ab;${style || ''}`;
    return p;
  }

  function btn(text, onClick, primary) {
    const b = el('button', null, text);
    b.style.cssText = `
      height:40px;border-radius:7px;border:1px solid ${primary ? '#dc2626' : '#273449'};
      background:${primary ? '#dc2626' : 'transparent'};color:#f8fafc;font-weight:600;font-size:13px;
      font-family:Inter,sans-serif;cursor:pointer;width:100%;
    `;
    b.addEventListener('click', onClick);
    return b;
  }

  function selectBox(value, placeholder, onClick) {
    const d = el('button', null, `<span>${value || placeholder}</span>`);
    d.style.cssText = `
      height:42px;border-radius:7px;border:1px solid #273449;background:#020617;color:${value ? '#f8fafc' : '#596579'};
      font-size:13px;font-family:Inter,sans-serif;text-align:left;padding:0 12px;cursor:pointer;width:100%;
    `;
    d.addEventListener('click', onClick);
    return d;
  }

  // --- Step 1: station / rota select ---
  function renderSelect() {
    setNarrative('Step 1 — Unlock the duty', 'Pick a station and rota, just like a real Section Commander would at the start of a shift.');
    const title = el('h4', null, 'Section Commander');
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:17px;color:#f8fafc;margin:4px 0 2px;';
    const sub = label('Pick your Station and Rota to continue.');

    const stationBtn = selectBox(state.station, '— Select Station —', () => {
      state.station = 'STN44';
      render();
    });
    const rotaBtn = selectBox(state.rota, '— Select Rota —', () => {
      if (!state.station) return;
      state.rota = 'ROTA 2';
      render();
    });
    rotaBtn.disabled = false;
    if (!state.station) rotaBtn.style.opacity = '0.5';

    const cont = btn('Continue', () => { if (state.station && state.rota) render(); }, true);
    cont.disabled = !(state.station && state.rota);
    if (cont.disabled) cont.style.opacity = '0.5';

    screenWrap([title, sub, label('Station', 'margin-top:8px;'), stationBtn, label('Rota'), rotaBtn, cont]);
  }

  // --- Step 2: PIN entry ---
  function renderPin() {
    setNarrative('Step 2 — Enter the duty PIN', 'The real PIN is set per Rota by the IC. This demo uses a fixed sample PIN: 6767.');
    const title = el('h4', null, 'Enter the duty PIN');
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:17px;color:#f8fafc;margin:4px 0 2px;text-align:center;';
    const sub = label(`${state.station} — ${state.rota}`, 'text-align:center;margin-bottom:6px;');

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
          if (state.pin === '6767') { state.unlocked = true; render(); }
          else { state.pin = ''; render(); setNarrative('Wrong PIN', 'Try 6767 — that\'s this demo\'s fixed sample PIN.'); }
        } else if (state.pin.length < 4) state.pin += k;
        if (k !== 'OK') render();
      });
      keypad.appendChild(b);
    });

    screenWrap([title, sub, pinDisplay, keypad]);
  }

  // --- Step 3: duty list ---
  const SAMPLE = {
    hydrantNo: 'DPH21519',
    address: 'Choa Chu Kang Avenue 7',
    appliance: 'LF441',
  };

  function renderDutyList() {
    setNarrative('Step 3 — Today\'s duty', 'One sample hydrant is assigned for this demo. Tap it to open the inspection.');
    const title = el('h4', null, "Today's duty");
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:17px;color:#f8fafc;margin:4px 0 2px;';
    const sub = label(`${state.station} — ${state.rota}`);

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

    screenWrap([title, sub, tab, card]);
  }

  // --- Step 4: drawer (defect + photos) ---
  function renderDrawer() {
    const allPhotos = state.photo1 && state.photo2;
    const canComplete = !state.defectSelected || allPhotos;

    if (!state.defectSelected) {
      setNarrative('Step 4 — Log a defect', 'Select a defect to see the photo requirement appear.');
    } else if (!allPhotos) {
      setNarrative('Step 5 — Attach 2 photos', 'Both photo slots are required before this can be saved — tap each one to simulate attaching a photo.');
    } else {
      setNarrative('Step 6 — Mark it complete', 'Both photos are in. The hydrant can now be marked tested.');
    }

    const back = el('button', null, '← Back');
    back.style.cssText = 'background:none;border:none;color:#8b97ab;font-size:12px;cursor:pointer;padding:0;text-align:left;';
    back.addEventListener('click', () => { state.hydrantOpen = false; render(); });

    const title = el('h4', null, SAMPLE.hydrantNo);
    title.style.cssText = 'font-family:Oswald,sans-serif;font-size:18px;color:#f8fafc;margin:6px 0 0;';
    const addr = label(SAMPLE.address);

    const toggleRow = el('div');
    toggleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;border:1px solid #273449;border-radius:8px;background:#020617;padding:10px 12px;margin-top:6px;';
    toggleRow.innerHTML = `<span style="font-size:12.5px;color:#e2e8f0;">Inspection completed</span>`;
    const dot = el('div');
    dot.style.cssText = `width:36px;height:20px;border-radius:10px;background:${state.completed ? '#dc2626' : '#1e293b'};position:relative;cursor:${canComplete ? 'pointer' : 'not-allowed'};opacity:${canComplete ? '1' : '0.5'};`;
    dot.innerHTML = `<span style="position:absolute;top:2px;left:${state.completed ? '18px' : '2px'};width:16px;height:16px;border-radius:50%;background:#f8fafc;transition:left .15s;"></span>`;
    dot.addEventListener('click', () => { if (canComplete) { state.completed = !state.completed; render(); } });
    toggleRow.appendChild(dot);

    const defectLabel = label('Defect', 'margin-top:8px;');
    const defectPill = el('button', null, state.defectSelected ? 'Spindle head unable to fit hydrant key' : 'No defect selected');
    defectPill.style.cssText = `
      width:100%;text-align:left;height:38px;border-radius:7px;border:1px solid #273449;
      background:#020617;color:${state.defectSelected ? '#f8fafc' : '#596579'};font-size:12px;padding:0 10px;cursor:pointer;
    `;
    defectPill.addEventListener('click', () => { state.defectSelected = !state.defectSelected; if (!state.defectSelected) { state.photo1 = false; state.photo2 = false; } render(); });

    const children = [back, title, addr, toggleRow, defectLabel, defectPill];

    if (state.defectSelected) {
      const photoLabel = label('Attach 2 photos for this hydrant *', 'margin-top:4px;color:#fbbf24;');
      const photoRow = el('div');
      photoRow.style.cssText = 'display:flex;gap:8px;';
      [1, 2].forEach((n) => {
        const filled = n === 1 ? state.photo1 : state.photo2;
        const slot = el('button', null, filled ? '✓ Photo ' + n : '+ Photo ' + n);
        slot.style.cssText = `
          flex:1;height:60px;border-radius:7px;border:1px dashed ${filled ? '#334155' : '#273449'};
          background:${filled ? '#1c1207' : '#020617'};color:${filled ? '#4ade80' : '#596579'};
          font-size:11px;cursor:pointer;
        `;
        slot.addEventListener('click', () => { if (n === 1) state.photo1 = !state.photo1; else state.photo2 = !state.photo2; render(); });
        photoRow.appendChild(slot);
      });
      children.push(photoLabel, photoRow);
      if (!allPhotos) children.push(label('Both photos are required before this can be saved.', 'color:#fbbf24;margin-top:2px;'));
    }

    if (state.completed) {
      const done = el('div', null, '✓ Marked complete — nice work.');
      done.style.cssText = 'margin-top:10px;background:#052e16;color:#4ade80;font-size:12px;padding:8px 10px;border-radius:7px;text-align:center;';
      children.push(done);
    }

    screenWrap(children);
  }

  restartBtn.addEventListener('click', () => {
    state.station = ''; state.rota = ''; state.pin = ''; state.unlocked = false;
    state.hydrantOpen = false; state.defectSelected = false; state.photo1 = false; state.photo2 = false; state.completed = false;
    render();
  });

  render();
})();
