// FRESH CUT — ui.js
// The notebook is the meta-UI. The HUD is four quiet things. Story arrives as texts you can ignore.
import { JOBS, BLOCKS, GEAR_UNLOCKS } from './yards.js';
import { TROPHIES, earnedPaints, ensure as ensureTrophies } from './trophies.js';
import { GEARS } from './game.js';

const $ = (id) => document.getElementById(id);
export const el = {
  hud: $('hud'), pct: $('pct'), jobname: $('jobname'), zones: $('zones'), zbanner: $('zonebanner'),
  toolchip: $('toolchip'), radiochip: $('radiochip'), texts: $('texts'), hint: $('hint'), flash: $('flash'),
  title: $('title'), notebook: $('notebook'), brief: $('brief'), complete: $('complete'), pause: $('pause'), credits: $('credits'),
};
export function show(id) { el[id].classList.remove('hidden'); }
export function hide(id) { el[id].classList.add('hidden'); }
export function hudOn(on) { el.hud.classList.toggle('on', on); }

// ---------- HUD ----------
export function setPct(p, jobName) {
  el.pct.innerHTML = `${Math.floor(p * 100)}%<small>${jobName.toUpperCase()}</small>`;
}
export function setTool(tool, high, gearKey) {
  const g = GEARS[gearKey];
  el.toolchip.innerHTML = tool === 'mow'
    ? `<b>MOWER</b> — ${g.name}${high ? ' · <span style="color:#e8b04b">HIGH-CUT</span>' : ''}<span class="keys">E trimmer · F high-cut · R radio · Z zones · L last blade · Esc pause</span>`
    : `<b>TRIMMER</b> — hold click to cut<span class="keys">E mower · R radio · Z zones · L last blade · Esc pause</span>`;
}
export function setRadioChip(name) {
  if (!name || name === 'off') { el.radiochip.classList.remove('on'); return; }
  el.radiochip.textContent = '♪ ' + name;
  el.radiochip.classList.add('on');
}
let bannerT = null;
export function zoneBanner(name, done, total) {
  el.zbanner.querySelector('.zb1').textContent = `ZONE CLEAN — ${done} OF ${total}`;
  el.zbanner.querySelector('.zb2').textContent = name;
  el.zbanner.classList.add('pop');
  clearTimeout(bannerT); bannerT = setTimeout(() => el.zbanner.classList.remove('pop'), 2100);
}
export function renderZones(names, pcts, doneArr, visible) {
  el.zones.classList.toggle('on', visible);
  if (!visible) return;
  el.zones.innerHTML = names.map((n, i) =>
    `<div class="${doneArr[i] ? 'done' : ''}"><span>${n}</span><span>${Math.floor(pcts[i] * 100)}%</span></div>`).join('');
}
let hintT = null;
export function hint(t, ms = 4200) {
  el.hint.textContent = t; el.hint.classList.add('on');
  clearTimeout(hintT); hintT = setTimeout(() => el.hint.classList.remove('on'), ms);
}
export function sms(who, text, sticky = false) {
  const d = document.createElement('div'); d.className = 'sms';
  d.innerHTML = (who ? `<div class="who">${who}</div>` : '') + text.replace(/\n/g, '<br>');
  el.texts.appendChild(d);
  while (el.texts.children.length > 3) el.texts.removeChild(el.texts.firstChild);
  if (!sticky) setTimeout(() => { d.style.transition = 'opacity 1.2s'; d.style.opacity = 0; setTimeout(() => d.remove(), 1300); }, 9000);
}
export function clearSms() { el.texts.innerHTML = ''; }
export function flash() {
  el.flash.style.transition = 'none'; el.flash.style.opacity = 0.85;
  requestAnimationFrame(() => { el.flash.style.transition = 'opacity 1.6s'; el.flash.style.opacity = 0; });
}

// ---------- notebook ----------
export function renderNotebook(save, onPick) {
  const jobsEl = $('nb-jobs');
  const campaign = JOBS.filter(j => !j.odd && !j.tour && !j.goofy);
  const doneCount = campaign.filter(j => save.done[j.id]).length;
  const finaleDone = !!save.done['pops'];
  $('nb-progress').textContent = `${doneCount} of ${campaign.length} pages inked${finaleDone ? ' — and the weird calls' : ''}`;
  let html = '';
  let prevDone = true;
  for (let b = 0; b < BLOCKS.length; b++) {
    const blockJobs = JOBS.filter(j => (j.block === b && !(b === 4 && (j.tour || j.goofy))) || (b === 4 && j.odd && !j.tour && !j.goofy));
    if (!blockJobs.length) continue;
    if (b === 4 && !finaleDone) { html += `<div class="blockhead">— a few pages are stuck together —</div>`; continue; }
    html += `<div class="blockhead">${BLOCKS[b].name} · <span style="font-weight:normal;letter-spacing:0;text-transform:none;color:#8a7c62">${BLOCKS[b].sub}</span></div>`;
    const gu = GEAR_UNLOCKS.find(u => u.afterJobs === b * 5 && u.afterJobs > 0);
    if (gu && doneCount >= gu.afterJobs) html += `<div class="gearnote">🛠 ${gu.note}</div>`;
    for (const j of blockJobs) {
      const done = save.done[j.id];
      const locked = b < 4 ? !prevDone : false;
      const st = done ? '✓' : locked ? '🔒' : (j.goofy ? '◇' : j.tour ? '◈' : j.odd ? '☎' : '▢');
      const missedKeep = done && j.disc?.some(d => d.tier === 'keep') && !done.keeps;
      html += `<div class="jobrow ${locked ? 'locked' : ''}" data-id="${j.id}">
        <div class="st" style="${done ? 'color:#c0392b' : ''}">${st}</div>
        <div class="nm"><b>${j.name}</b>${done ? ' <span class="done-ink">DONE</span>' : ''}${missedKeep ? ' <span title="something is still out there">◇</span>' : ''}
          <span class="margin">${j.pop !== '—' ? '“' + j.pop + '”' : ''}</span></div>
        <div class="meta">${j.client}<br>${j.lot.w}×${j.lot.h}m</div>
      </div>`;
      if (!j.odd) prevDone = !!done;
    }
  }
  jobsEl.innerHTML = html;
  jobsEl.querySelectorAll('.jobrow:not(.locked)').forEach(r => r.onclick = () => onPick(r.dataset.id));
  // pegboard
  const pb = $('pegboard-list');
  const jarCell = save.jar > 0 ? `<div class="peg"><div class="ico">🫙</div><div>The Jar</div><div class="tier">${save.jar} odds &amp; ends</div></div>` : '';
  if (!save.pegboard.length && !save.jar) pb.innerHTML = `<div style="grid-column:1/-1;color:#8a7c62;font-style:italic;padding:20px 4px">The pegboard is bare. The grass is holding out on you.</div>`;
  else pb.innerHTML = jarCell + save.pegboard.map(p => `<div class="peg ${p.tier === 'keep' ? 'keep' : ''}">
    <div class="ico">${p.tier === 'keep' ? '🏆' : '💌'}</div>
    <div>${p.label}</div><div class="tier">${p.tier === 'keep' ? 'keepsake' : 'returned'} · ${p.from}</div>
  </div>`).join('');
}
export function wireNotebookTabs() {
  // generic: every .nb-tab shows #nb-<tab> and hides the others, so a new page is a button
  // plus a div. It used to name all three ids by hand, which is how a fourth gets forgotten.
  const tabs = [...document.querySelectorAll('.nb-tab')];
  tabs.forEach(t => t.onclick = () => {
    tabs.forEach(x => x.classList.toggle('on', x === t));
    tabs.forEach(x => $('nb-' + x.dataset.tab)?.classList.toggle('hidden', x !== t));
  });
}

// ---------- the numbers ----------
// The back page, where Pop kept his tallies. Every figure here is measured from the save —
// nothing is estimated, and a fresh save honestly reads zero rather than inventing a career.
const hms = (s) => {
  s = Math.round(s || 0);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s % 60).padStart(2, '0')}s`;
};
const num = (n) => Math.round(n || 0).toLocaleString();
export function renderNumbers(save) {
  ensureTrophies(save);
  const L = save.lifetime, done = save.done || {};
  const ids = Object.keys(done);
  const book = (pred) => { const all = JOBS.filter(pred); return [all.filter(j => done[j.id]).length, all.length]; };
  const [mainD, mainT] = book(j => !j.odd && !j.tour && !j.goofy);
  const [oddD, oddT] = book(j => j.odd);
  const [tourD, tourT] = book(j => j.tour);
  const [gooD, gooT] = book(j => j.goofy);
  // a lawn is about 300 m² — the unit the job is actually measured in
  const lawns = (L.area / 300);
  const gearJobs = L.gearJobs || {};
  const favGear = Object.keys(gearJobs).sort((a, b) => gearJobs[b] - gearJobs[a])[0];
  const big = (v, label) => `<div class="numcell"><div class="numv">${v}</div><div class="numl">${label}</div></div>`;
  let h = `<div class="numgrid">
    ${big(num(L.area) + ' m²', 'grass cut')}
    ${big(hms(L.time), 'on the clock')}
    ${/* ⚠️ not num()/10 — toLocaleString puts a comma in past 10,000 and the divide gives NaN */''}
    ${big((L.dist / 1000).toFixed(1) + ' km', 'walked behind a mower')}
    ${big(ids.length + '/' + JOBS.length, 'pages inked')}
  </div>
  <div class="pegnote">That is ${lawns < 1 ? 'not quite one lawn' : lawns.toFixed(1) + ' front lawns'}, at three hundred square metres a lawn.</div>`;

  h += `<div class="blockhead">The Books</div>`;
  for (const [nm, d, t] of [['The Route', mainD, mainT], ['The Odd Jobs', oddD, oddT],
                            ['The Wider Job Book', tourD, tourT], ['The Odd Sizes', gooD, gooT]]) {
    h += `<div class="jobrow"><div class="st" style="${d >= t ? 'color:#c0392b' : ''}">${d >= t ? '✔' : '▢'}</div>
      <div class="who"><div class="nm">${nm}</div>
        <span class="margin"><span class="numbar"><i style="width:${t ? (d / t * 100).toFixed(0) : 0}%"></i></span></span></div>
      <div class="meta">${d}/${t}</div></div>`;
  }

  h += `<div class="blockhead">The Tallies</div>`;
  const tally = [
    ['Bags tipped out', num(L.bags)],
    ['Things found in the grass', num((save.pegboard || []).length)],
    ['Junk in the jar', num(save.jar)],
    ['Jobs where nothing was missed', num(L.perfectFinds)],
    ['Best pattern score', L.patternBest ? L.patternBest + '/100' : '—'],
    ['Trophies on the shelf', `${(save.trophies || []).length}/${TROPHIES.length}`],
    ['The one you reach for', favGear ? `${GEARS[favGear].name} (${gearJobs[favGear]} job${gearJobs[favGear] === 1 ? '' : 's'})` : '—'],
  ];
  for (const [k, v] of tally) h += `<div class="jobrow"><div class="who"><div class="nm">${k}</div></div><div class="meta">${v}</div></div>`;

  h += `<div class="blockhead">Page by Page</div>`;
  if (!ids.length) h += `<div class="pegnote">Nothing here yet. The first page fills itself in.</div>`;
  for (const j of JOBS) {
    const d = done[j.id]; if (!d) continue;
    const bits = [d.plays > 1 ? `${d.plays} visits` : '1 visit'];
    if (d.time > 0) bits.push(`best ${hms(d.time)}`);   // a pre-v1.31 row has no time; don't print "0m 00s"
    if (d.area) bits.push(`${num(d.area)} m²`);
    if (d.pattern) bits.push(`pattern ${d.pattern}`);
    if (d.gear && GEARS[d.gear]) bits.push(GEARS[d.gear].name);
    h += `<div class="jobrow"><div class="st" style="color:#c0392b">✔</div>
      <div class="who"><div class="nm">${j.name}</div><span class="margin">${bits.join(' · ')}</span></div>
      <div class="meta">${d.found || 0} found</div></div>`;
  }
  $('numbers-list').innerHTML = h;
}
// The shelf in the garage: what you've earned, and the paint it came with. Locked rows
// still show their name and how to get them — nothing here is a secret, it's a to-do list.
export function renderShelf(save, onPaint) {
  ensureTrophies(save);
  const got = new Set(save.trophies);
  let h = `<div class="pegnote">${got.size} of ${TROPHIES.length} on the shelf</div>`;
  for (const t of TROPHIES) {
    const on = got.has(t.id);
    h += `<div class="jobrow" style="${on ? '' : 'opacity:.5'}">
      <div class="st" style="${on ? 'color:#c0392b' : ''}">${on ? '🏆' : '▢'}</div>
      <div class="who"><div class="nm">${t.name}</div><span class="margin">${t.note}</span></div>
      <div class="meta">${t.paint ? (on ? 'paint earned' : 'paint') : ''}</div>
    </div>`;
  }
  const paints = earnedPaints(save);
  h += `<div class="blockhead">The Paint Tin</div><div id="paint-row" style="display:flex;gap:10px;flex-wrap:wrap;padding:6px 2px">`;
  for (const p of paints) {
    const sel = (save.paint || null) === (p.c || null);
    const swatch = p.c === null ? 'linear-gradient(135deg,#c0392b 50%,#e8e3d8 50%)' : '#' + p.c.toString(16).padStart(6, '0');
    h += `<button class="mbtn small paint-pick" data-c="${p.c === null ? '' : p.c}" title="${p.name}"
      style="width:44px;height:34px;background:${swatch};border:2px solid ${sel ? '#c0392b' : 'rgba(61,52,40,.35)'}"></button>`;
  }
  h += `</div><div class="pegnote">Paint is earned, never bought. It shows on the walk-behind mowers.</div>`;
  $('shelf-list').innerHTML = h;
  document.querySelectorAll('.paint-pick').forEach(b => b.onclick = () => {
    const v = b.dataset.c;
    onPaint(v === '' ? null : parseInt(v, 10));
    renderShelf(save, onPaint);
  });
}

// ---------- briefing ----------
export function renderBrief(def, save, onGo, onBack) {
  $('bf-name').textContent = def.name;
  $('bf-client').textContent = def.client;
  $('bf-blurb').textContent = def.blurb;
  $('bf-pop').textContent = def.pop && def.pop !== '—' ? `Pop's margin: “${def.pop}”` : '';
  $('bf-pop').style.display = def.pop && def.pop !== '—' ? '' : 'none';
  const tiers = (def.tiers || []).map(t => t.tier);
  const maxTier = Math.max(1, ...tiers);
  const tierName = ['', 'kept', 'shaggy', 'overgrown', 'JUNGLE'][maxTier];
  // gear picker
  const unlocked = GEAR_UNLOCKS.filter(u => countCampaignDone(save) >= u.afterJobs).map(u => u.gear);
  let gearHtml = '';
  if (def.gearLock) gearHtml = `<b>${GEARS[def.gearLock].name}</b> — this one's already decided.`;
  else gearHtml = `Mower: <select id="bf-gear">` + unlocked.map(g =>
    `<option value="${g}" ${g === bestGear(unlocked, def) ? 'selected' : ''}>${GEARS[g].name} (${GEARS[g].swath}m)</option>`).join('') + `</select>`;
  $('bf-stats').innerHTML = `${def.lot.w}×${def.lot.h} m · tallest grass: <b>${tierName}</b> · ${(def.zones || []).length} zones &nbsp;·&nbsp; ${gearHtml}`;
  $('bf-go').onclick = () => onGo(def.gearLock || $('bf-gear')?.value || 'push');
  $('bf-back').onclick = onBack;
}
export function countCampaignDone(save) { return JOBS.filter(j => !j.odd && save.done[j.id]).length; }
function bestGear(unlocked, def) {
  const area = def.lot.w * def.lot.h;
  if (unlocked.includes('rider') && area > 500) return 'rider';
  if (unlocked.includes('wide') && area > 300) return 'wide';
  if (unlocked.includes('self')) return 'self';
  return 'push';
}

// ---------- postcard / complete ----------
let pcBefore = null, pcAfter = null, pcDef = null, pcPattern = null;
export function renderComplete(def, stats, beforeImg, afterImg, replyText, onNext) {
  pcBefore = beforeImg; pcAfter = afterImg; pcDef = def; pcPattern = stats.pattern || null;
  $('comp-title').textContent = def.finale ? 'Last page.' : def.daily ? 'Today’s page, inked.' : 'Fresh Cut.';
  const mins = Math.floor(stats.time / 60), secs = Math.floor(stats.time % 60);
  let line = `${mins}m ${String(secs).padStart(2, '0')}s on the clock · ${Math.round(stats.dist)} m walked · ${stats.found}/${stats.totalDisc} things found in the grass`;
  // pattern maps earn a line of their own on the card. Praise only — a low number still
  // reads as a finished job, because it is one.
  if (stats.pattern) {
    const s = stats.pattern.score;
    const badge = s >= 88 ? 'championship stripes' : s >= 72 ? 'proper bands' : s >= 55 ? 'stripes, in the right light' : 'cut clean';
    line += ` · pattern ${s}/100 — ${badge}`;
  }
  $('comp-stats').textContent = line;
  const reply = $('comp-reply'); reply.innerHTML = '';
  if (replyText) {
    const d = document.createElement('div'); d.className = 'sms'; d.style.textAlign = 'left';
    d.innerHTML = (def.who ? `<div class="who">${def.who}</div>` : '') + replyText.replace(/\n/g, '<br>');
    reply.appendChild(d);
  }
  $('pc-slider').value = 50;
  drawPostcard(50);
  // images decode async — redraw when they land or the after side is a black hole
  for (const im of [pcBefore, pcAfter]) if (im && !im.complete) im.onload = () => drawPostcard(+$('pc-slider').value);
  $('pc-slider').oninput = (e) => drawPostcard(+e.target.value);
  $('comp-save').onclick = savePostcard;
  $('comp-next').textContent = def.finale ? 'Sit a while longer' : 'Back to the notebook';
  $('comp-next').onclick = onNext;
  show('complete');
}
function drawPostcard(split) {
  const cv = $('pc-canvas'), x = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  if (pcAfter) x.drawImage(pcAfter, 0, 0, W, H);
  if (pcBefore && split > 0) {
    const sw = W * split / 100;
    x.save(); x.beginPath(); x.rect(0, 0, sw, H); x.clip();
    x.drawImage(pcBefore, 0, 0, W, H); x.restore();
    x.fillStyle = 'rgba(253,251,244,0.9)'; x.fillRect(sw - 2, 0, 4, H);
    x.font = 'italic 22px Georgia'; x.textAlign = 'left';
    x.fillStyle = 'rgba(253,251,244,0.95)'; x.fillText('before', 18, 34);
    x.textAlign = 'right'; x.fillText('after', W - 18, 34);
  }
  // caption strip
  x.fillStyle = 'rgba(24,30,18,0.72)'; x.fillRect(0, H - 64, W, 64);
  x.fillStyle = '#f2ead2'; x.font = '26px Georgia'; x.textAlign = 'left';
  x.fillText(pcDef.name + ' — Hazel Park', 20, H - 24);
  x.font = 'bold 20px Georgia'; x.textAlign = 'right'; x.fillStyle = '#e8b04b';
  x.fillText(pcDef.id === 'terrarium' ? 'RETURN TO SENDER ♥' : 'FRESH CUT', W - 20, H - 24);
  // pattern maps get a stamp in the corner of the keepsake itself, not just the screen
  if (pcPattern) {
    const s = pcPattern.score, r = 40, cx2 = W - 64, cy2 = 62;
    x.save();
    x.globalAlpha = 0.92;
    x.beginPath(); x.arc(cx2, cy2, r, 0, 6.283);
    x.fillStyle = 'rgba(24,30,18,0.66)'; x.fill();
    x.lineWidth = 3; x.strokeStyle = s >= 88 ? '#e8b04b' : s >= 72 ? '#cfd8c0' : '#a9a396'; x.stroke();
    x.textAlign = 'center'; x.fillStyle = '#f2ead2';
    x.font = 'bold 28px Georgia'; x.fillText(String(s), cx2, cy2 + 4);
    x.font = 'italic 13px Georgia'; x.fillText('pattern', cx2, cy2 + 22);
    x.restore();
  }
}
function savePostcard() {
  const a = document.createElement('a');
  a.download = `freshcut-${pcDef.id}-${Date.now()}.png`;
  a.href = $('pc-canvas').toDataURL('image/png');
  a.click();
}

// ---------- credits ----------
export function renderCredits(onDone) {
  $('cred-body').innerHTML =
    `The notebook is full. Both sides of every page.<br><br>
     Marge's peonies made it. The twins found their arsenal. Coach got his stripes,<br>
     Brenda the grill lives, the gnomes have their names, and the circuit is walkable<br>
     every evening, right after supper.<br><br>
     A town runs on small kept promises.<br>Somebody has to push the mower.`;
  $('cred-dedic').textContent = '— for everyone who ever waved from a kitchen window —';
  $('cred-done').onclick = onDone;
  show('credits');
}
