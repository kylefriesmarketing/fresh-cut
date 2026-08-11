// FRESH CUT — trophies.js
// The shelf in Pop's garage. Everything here is earned by DOING the work, never bought —
// invariant 1 says no money-per-job, and the gear arc has always been career unlocks. So
// trophies are the reward currency, and some of them hand you a tin of paint.
//
// Nothing here can be failed or missed permanently: every trophy is still available on
// every future job, and none of them gate a map.
import { JOBS } from './yards.js';

const doneIds = (s) => Object.keys(s.done || {});
const doneCount = (s, pred) => JOBS.filter(pred).filter(j => s.done[j.id]).length;
const lt = (s, k) => (s.lifetime && s.lifetime[k]) || 0;

export const TROPHIES = [
  { id: 'first', name: 'The First Page', note: 'Finish a job.', check: s => doneIds(s).length >= 1 },
  { id: 'five', name: 'Getting Known', note: 'Finish five jobs.', check: s => doneIds(s).length >= 5, paint: 0x3e7247 },
  { id: 'route', name: "Pop's Route", note: 'Finish every page of the main book.', check: s => doneCount(s, j => !j.odd && !j.tour && !j.goofy) >= JOBS.filter(j => !j.odd && !j.tour && !j.goofy).length, paint: 0x8a3f3f },
  { id: 'oddjobs', name: 'The Weird Calls', note: 'Finish all four Odd Jobs.', check: s => doneCount(s, j => j.odd && !j.tour && !j.goofy) >= 4 },
  { id: 'wider', name: 'The Wider Book', note: 'Finish all ten of the wider job book.', check: s => doneCount(s, j => j.tour) >= 10, paint: 0x2f6ea5 },
  { id: 'odd', name: 'A Question of Scale', note: 'Finish all ten of The Odd Sizes.', check: s => doneCount(s, j => j.goofy) >= 10, paint: 0x8e44ad },
  { id: 'everything', name: 'The Whole Book', note: 'Finish every job in every book.', check: s => doneIds(s).length >= JOBS.length, paint: 0xd8a23f },

  { id: 'keep5', name: 'The Pegboard', note: 'Bring home five keepsakes.', check: s => (s.pegboard || []).filter(p => p.tier === 'keep').length >= 5 },
  { id: 'keep15', name: 'The Full Pegboard', note: 'Bring home fifteen keepsakes.', check: s => (s.pegboard || []).filter(p => p.tier === 'keep').length >= 15, paint: 0xc9a13f },
  { id: 'returned', name: 'Returned to Sender', note: 'Return ten things to the people who lost them.', check: s => (s.pegboard || []).length >= 10 },
  { id: 'jar', name: 'The Jar', note: 'Put fifty pieces of junk in the jar.', check: s => (s.jar || 0) >= 50 },

  { id: 'walk10', name: 'Ten Kilometres', note: 'Walk ten kilometres behind a mower.', check: s => lt(s, 'dist') >= 10000 },
  { id: 'walk40', name: 'The Long Season', note: 'Walk forty kilometres.', check: s => lt(s, 'dist') >= 40000, paint: 0x4f7a52 },
  { id: 'bags', name: 'Emptied Again', note: 'Fill and tip the bag fifty times.', check: s => lt(s, 'bags') >= 50 },
  { id: 'hours', name: 'An Afternoon of It', note: 'Spend five hours cutting.', check: s => lt(s, 'time') >= 18000 },

  { id: 'stripes', name: 'Proper Bands', note: 'Score 80 or better on a pattern.', check: s => lt(s, 'patternBest') >= 80 },
  { id: 'champ', name: 'Championship Stripes', note: 'Score 95 or better on a pattern.', check: s => lt(s, 'patternBest') >= 95, paint: 0xe8792c },

  { id: 'thorough', name: 'Nothing Missed', note: 'Finish a job having found everything in it.', check: s => !!lt(s, 'perfectFinds') },
  { id: 'night', name: 'The Night Shift', note: 'Finish a job after dark.', check: s => !!s.done['cemetery'] || !!s.done['threeam'] },
  { id: 'titan', name: 'The Titan', note: 'Finish a job with the big deck.', check: s => (s.lifetime?.gears || []).includes('titan') },
  { id: 'tweezer', name: 'Small Work', note: 'Finish a job with the Tweezers.', check: s => (s.lifetime?.gears || []).includes('tweezer') },
  { id: 'allgear', name: 'Every Machine in the Shed', note: 'Finish a job with each of the seven mowers.', check: s => ['push', 'self', 'wide', 'rider', 'titan', 'hover', 'tweezer'].every(g => (s.lifetime?.gears || []).includes(g)), paint: 0x1f2933 },
];

// paint is the customisation: earned, never bought. push/self/wide/rider read save.paint.
export const PAINTS = [
  { c: null, name: 'As it came' },
  ...TROPHIES.filter(t => t.paint).map(t => ({ c: t.paint, name: t.name, from: t.id })),
];

export function ensure(save) {
  if (!save.trophies) save.trophies = [];
  if (!save.lifetime) save.lifetime = { dist: 0, time: 0, bags: 0, patternBest: 0, perfectFinds: 0, gears: [] };
  if (!save.lifetime.gears) save.lifetime.gears = [];
  if (save.paint === undefined) save.paint = null;
  return save;
}

// call at job completion — folds the run into lifetime totals, then returns any NEW trophies
export function award(save, run) {
  ensure(save);
  const L = save.lifetime;
  L.dist += run.dist || 0;
  L.time += run.time || 0;
  L.bags += run.bags || 0;
  if (run.pattern && run.pattern.score > L.patternBest) L.patternBest = run.pattern.score;
  if (run.totalDisc > 0 && run.found >= run.totalDisc) L.perfectFinds++;
  if (run.gear && !L.gears.includes(run.gear)) L.gears.push(run.gear);
  const fresh = [];
  for (const t of TROPHIES) {
    if (save.trophies.includes(t.id)) continue;
    let ok = false;
    try { ok = !!t.check(save); } catch (_) { ok = false; }
    if (ok) { save.trophies.push(t.id); fresh.push(t); }
  }
  return fresh;
}
export function earnedPaints(save) {
  ensure(save);
  return PAINTS.filter(p => !p.from || save.trophies.includes(p.from));
}
