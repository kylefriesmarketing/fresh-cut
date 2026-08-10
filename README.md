# FRESH CUT — *a lawn mowing simulator*

You inherit Pop's mower and his client notebook, and cut your way through Hazel Park
one overgrown yard at a time. First-person, no failure, no timers. The grass stays cut.

## Play

Double-click **PLAY-FRESH-CUT.bat** (starts a tiny local server + opens the browser),
or `node serve.mjs` → http://localhost:8437. ES modules need http://, not file://.
Deploy = copy the whole folder to any static host (GitHub Pages works as-is).

**Controls:** WASD push · mouse steer (click to capture) · **E** mower/trimmer ·
**F** high-cut lever (jungle grass needs it first) · hold **LMB** to trim ·
**R** Pop's radio · **Z** zone list · **L** last-blade glow · **Esc** pause.

## v1.8 (2026-08-10) — the sound of the block

Three new voices in the summer bed, all synthesized like everything else, all on the amb
bus, all tracked and stopped by `ambStop`.

- **Distant lawnmower** — someone three gardens over is doing exactly what you're doing:
  a detuned saw+square through a 230 Hz lowpass with a ~10 Hz putter AM. It fades in, then
  drifts up and down over 26–70 s as they walk their own rows, fades out, and comes back a
  minute or two later. This is the one that makes the street feel like a Saturday.
- **Kids playing** — distant shrieks and laughing, two gardens away, never words: a
  triangle with a rising-then-falling pitch glide through a vowel-ish bandpass and a 1.5 kHz
  lowpass for distance. 40% of calls get a five-beat amplitude wobble (a laugh). Bursts of
  2–4, every 20–58 s.
- **Birds, three voices instead of one** — the original trill, a lazy two-note call, and
  (16% of the time) a crow that only ever says it twice. The old single call on a loop was
  starting to read as one animal.

⚠️ **The finale gets `{ quiet: true }`** — it keeps the air, cicadas, birds and sprinkler
but loses every sign of other people (no kids, no neighbour mowing), because invariant 5
says that yard stays quiet. `ambStart(kind, opts)` carries it; main.js passes
`{ quiet: !!def.finale }`.

Verified by instrumenting `AudioContext.createOscillator` and classifying every voice by
type and frequency over a real-time window: in 57 s the day bed produced cicadas at 0 s,
a crow at 1 s, birdsong from 6 s (9 calls), sprinkler at 9 s, kids at 20 s and all three
mower voices at 21 s. `ambStop` took 7 nodes / 35 timers to **0 / 0**. New QA hooks:
`sfx.ambDebug()` and `window.__fc.sfx`.

## v1.7 (2026-08-10) — the neighbourhood: a street that is lived on

New module **`mow/street.js`** owns everything beyond the fence. Kyle's brief: a lived-in
street (not a busy road), a day that advances while you mow, richer sky, and all four car
behaviours.

- **Houses** — five across the street, each with varied body/roof colours, a gable, porch
  with posts and awning, shuttered windows, sills, a coloured front door, shrubs, a
  driveway, a garden path and a kerbside mailbox. Their window and porch-lamp materials are
  pushed into `world.windows`, so `applyLightPreset` lights the whole street at golden hour
  for free — no new machinery.
- **Traffic** — a recycled 5-car pool (sedan/pickup/van), near lane runs +x, far lane −x.
  Measured ~one car every 8 s on a normal job, never more than 2 on screen. Plus **parked
  cars** in drives and at the kerb, a **rare special** (ice cream truck with a music-box
  jingle / mail van / school bus — all three appear across the campaign), and **one
  authored arrival per job**: a car slows, turns into a drive on a bezier, parks facing the
  house, and a neighbour walks to the porch and goes in.
- **People** — a dog walker and a kid on a bike pass along the sidewalk with real leg/wheel
  motion, and someone sits out on a porch all afternoon.
- **Sky** — 6-stop gradient, **three cloud layers** (low/mid/high cirrus) at their own
  heights, scales, opacities and drift speeds so the sky has parallax, and a flock of birds
  that crosses now and then.
- **The day advances while you mow** — `warmTarget` now tracks job *progress* (not the
  clock, so the arc lands however long you take) up to **0.55**, and the sun disc visibly
  sinks and grows along the light's own arc. The full golden hour is still the finish's to
  give: completion sets it to 1.

⚠️ **The street is view-only and updates from `Game.frame()`, never `Game.update()`** —
verified by running 60 sim-seconds with no frames and confirming not one car moved. Headless
jobs never run a car, which is why the 24-job battery still takes ~1 s.
⚠️ Street pieces carry a little emissive of their own colour (`brighten()` in street.js).
The sun is aimed at the lot from +x/−z, so every street-facing surface over there gets
ambient only and rendered as a grey slab. Moving the sun would change the whole game's look;
lifting the background is the cheap fix. Meshes tagged `userData.keepMat` are skipped so the
window materials stay under `applyLightPreset`'s control.
- Quiet where it should be: the **finale** (`def.finale`) drops to ~2 cars in 90 s with no
  special, no pedestrians and no arrival, keeping invariant 5. Night jobs get half traffic.
  `def.street = false` disables the lot entirely.
- Cost: **0.77 ms/frame** (~5% of a 60 fps budget), measured with the street group toggled.
  24/24 jobs, 0 console errors.

## v1.6 (2026-08-09) — ⚠️ THE ROOT CAUSE: the ground overlay read the cut mask MIRRORED

"The lines still move in the opposite direction of the mower." That phrasing is a mirror,
and it was: **the ground overlay had been sampling the cut mask flipped along Z since the
overlay was written.** Everything else in v1.3–v1.5 was real, but this was the cause of
"doesn't line up".

- `this.overlay` is a `PlaneGeometry(W,H)` rotated −90° about X, which makes its **`uv.y`
  equal 1 at worldZ 0 and 0 at worldZ H**. But `uMask` is a `DataTexture`, and DataTexture
  sets `flipY: false`, so **its row 0 IS worldZ 0** — which is exactly how the blades read
  it (`texture2D(uMask, aOff / uLot)`). So the blades cut in the right place while the
  overlay painted the fresh-cut colour at `H − z`. As you mowed forward, the bright paint
  slid backwards.
- Fixed by sampling the mask with `vec2 mUv = vec2(vUv.x, 1.0 - vUv.y)`. `uTracks` stays on
  the raw `vUv` — it is a `CanvasTexture` (`flipY: true`), so it was already correct, and
  that was verified rather than assumed.

Proved with two complementary asymmetric cuts (blades hidden, so only the overlay renders):

```
cut band FAR (worldZ 11.5-13.4):  mirrored lit the NEAR rows 129/107/90/120
                                  fixed leaves them dark      102/ 82/66/ 58
cut band NEAR (worldZ 2.6-4.4):   fixed lights near rows 122/121/121
                                  mirrored leaves them   99/ 99/102
```

⚠️ **Why it hid for three rounds:** every test lawn happened to be mown roughly
symmetrically about the lot's Z centre (e.g. z 4.5–11.5 on H=15 mirrors to 3.5–10.5), so
the mirror overlapped itself and looked plausible. **Test ground-mask orientation with a
deliberately ASYMMETRIC cut, near one edge.** Wheel tracks were re-verified with a
controlled A/B (clear the canvas, re-render): darkening −5/−6 luma on the near rows only,
0 on the far rows.

Verified: 24/24 jobs, 0 console errors.

## v1.5 (2026-08-09) — stripe bands now match the passes you actually drove

"The bright green shading strips still don't line up with the mower as you mow."

`stamp()` bailed out of already-cut texels with `if (st === CUT) continue`, so the cut
**direction** — which is what the stripe tone is computed from — was written once, by
whichever pass reached a texel *first*, and never updated. Players overlap their passes,
so every overlapped sliver kept the previous lane's direction: the visible stripe edge
sat wherever pass 1 happened to stop, not where you drove pass 2.

Measured with lanes 0.4 m apart, alternating direction (the run-length of each direction
band across the lawn):

```
old: 0.5  0.25 0.125 0.375 0.375 0.5  0.375 …   spread 0.375 m  ← ragged, unrelated to the passes
new: 0.375 0.375 0.375 0.375 0.375 0.5 0.375 …  spread 0.125 m  ← one texel, matches lane spacing
```

The last mower pass now lays the nap: an already-cut texel gets its direction re-written
(`this.mask[b+1] = d8`) when the deck passes over it again. Cut counts, `fresh`, zone
totals and completion are all untouched, so nothing gameplay-side moves — only the tone.
The trimmer deliberately does **not** re-lay stripes (a string trimmer doesn't lay a nap);
verified that a trimmer pass leaves an existing stripe pattern byte-identical.

Verified: 24/24 jobs, 0 console errors, overlap follows the newer pass, cut count
unchanged by a re-stripe.

## v1.4 (2026-08-09) — the fresh-cut *shading*, which was the real culprit

Kyle: "the grass gets lighter behind the mower… the cutting works but the shading that
gives it that brighter green clean look is not happening right." He was right, and the
sim was innocent — the cut boundary was already measured at 3 mm from the deck (v1.3).

- **Fresh cut is now always the clean bright green.** The overlay painted cut ground as
  `mix(darkGreen, brightGreen, tone)` where `tone` came *entirely* from mow direction —
  so mowing one way painted the new cut nearly as dark as uncut grass. You genuinely
  could not see the cut happen under the deck; you only noticed the lane once you were
  past it and could read the stripes. Cut ground is now a bright base with the direction
  applying only a ±10% stripe (`vec3(0.42,0.66,0.24) * (0.90 + 0.20*tone)`, alpha
  0.50→0.60). Measured on two lanes cut in opposite directions under identical lighting:
  the dark-direction lane went **81 → 100** luma (uncut ≈ 57) while the bright lane held
  at 128 — stripes intact, neither direction muddy.
- **No more stubble speckle.** Cut blades were drawn root→tip, so a 4 cm blade showed a
  dark root under a bright tip and the finished lawn read as dirty. Cut blades now skip
  the dark root (`tmix` biased to tip) and sit almost exactly on the overlay's green, so
  the nap reads as turf texture rather than pale specks. Cut height 0.05 → 0.038.
- Verified: 24/24 jobs, 0 console errors, shaders compile, save round-trip; matched A/B
  captures with only the shader lines swapped live on one lawn.

⚠️ The mower body *does* occlude the ground directly beneath it from the default camera —
that is geometry, not a bug. The fix for "I can't see it cut" is contrast, not moving the
stamp: an earlier build pushed the stamp 1.02 m ahead of the player to make the cut peek
out in front of the deck, and that is exactly what read as "the lines don't line up."

## v1.3 (2026-08-09) — the cut lines up, and the lawn is actually clean

Second playtest pass. Both reports were real bugs, in different layers:

- **The cut now lands under the deck.** The stamp used a hardcoded `1.02` m for every
  gear while the mower is *drawn* at `0.86` (walk-behind) / `0.75` (rider's deck) — so
  the cut line floated 16 cm ahead of the push mower and **27 cm** ahead of the rider.
  Mowers now publish `userData.deckLocal` and the sim derives `game.deckAt` from it;
  stamping, wheel tracks, engine load, the shy-away effect and the nose collider all
  read that one number. Measured offset after: **3 mm** (one tick of render lag).
- **Cut grass no longer reads as clippings on the ground.** In the blade shader `lean`
  was an *absolute* world offset (`aRnd.z * 0.35`) applied as `y²·lean` — fine on a
  66 cm blade, but it threw a 5 cm cut blade's tip up to 35 cm sideways, so every mown
  texel rendered a pale blade lying flat on the lawn. `lean` now scales with blade
  height (`* 0.55 * hgt`): tall grass is pixel-identical, cut stubble stands up, and a
  finished lawn reads as smooth turf + stripes. Verified as a matched A/B on one lawn.
- **Clippings are now collected instead of littering.** Mown clippings are tagged and
  vacuumed to the bag mouth (no gravity, no ground contact) and swallowed within ~0.2 s;
  the mouth tracks the mower so in-flight clippings keep homing. Trimmer spray still
  falls to the lawn on purpose — no bag on a trimmer. The bag dump no longer sprays a
  pile either (that was the same litter it exists to prevent).
- **Fixed a latent save bug** found by the harness: `snapshot()` handed out the live
  `found`/`zoneDone` arrays, and `restore()` *appends* to `found` — so a same-instance
  snapshot→restore iterated an array it was growing and hung until the length
  overflowed. Snapshot now copies; restore rebuilds. Only bit tests (production
  round-trips through JSON), but it would have bitten any future in-place resume.
- Verified: **24/24 jobs** boot → mow → complete with deck alignment, bag present and
  **0 clippings resting on the lawn**, 0 console errors; push/rider alignment measured;
  bag fill → dump → save round-trip numeric.

## v1.2 (2026-08-09) — controls + the bag (first playtest feedback)

- **A/D un-inverted.** Strafe moved along the LEFT vector (forward is `(sin,cos)`,
  so screen-right is `(-cos,+sin)` — the old code used the negation). D is right now.
- **Handlebars rebuilt.** The tubes used to slope down *toward the player* with the
  grip floating disconnected above them. Now two tubes run from the deck's rear
  edge up to a grip bar at hand height (geometry computed from attach/grip points,
  so all deck widths line up), plus a crossbar. Trimmer now held on the RIGHT.
- **Every mower has a grass bag** (rear bag on walk-behinds, catcher on the rider).
  It visibly inflates as the deck eats (fill = fresh-cut texels / capacity;
  110 m² push/self, 140 wide, 190 rider), jiggles with the engine, and when full it
  **tips itself out** — clip burst + soft whump (`sfx.bagDump`), never a chore, no
  interruption. First time ever: one quiet parenthetical hint. Fill and bags-emptied
  survive save/resume.
- `serve.mjs` worked from no path containing a space (`URL.pathname` keeps `%20`);
  now uses `fileURLToPath`. New QA hook: `__fc.renderOnce(dt)` renders one real
  frame headlessly (the Browser pane suspends rAF) — pair with `__fc.shot()`.
- Verified: strafe direction at two yaws + A/W regression, bag fill→dump→hint→
  save-round-trip numerically, push/wide/rider boot + complete, trimmer side +0.25,
  pixel-diff proof the grip/tubes render connected, 0 console errors.

## v1.1 (2026-08-08) — houses + feel pass

Houses on 16 lots (porches, chimneys, shutters, glowing windows at golden hour;
the Foreclosure is boarded up; the church got a steeple; the terrarium's copy of
home is slightly wrong on purpose). Daily Lawn sometimes rolls a house. Feel:
tall grass now shies away from the running deck, wheel tracks press into the
lawn, the engine starts with a pull-cord rip-and-sputter, gust waves roll
through uncut grass, and the FOV breathes under load. Sun disc + drifting
clouds; all roofs rebuilt as true gables. Full battery re-verified: 24/24.

## What's in the build (v1.0, 2026-08-08)

- **19-page campaign** across 4 blocks (The Route → The Favors → The Rescues → The
  Landmarks) ending at Pop's house, + **4 Odd Jobs** after credits (mini-golf, the
  cemetery night shift, the drive-in, and the one that's better unspoiled), + the
  seeded **Daily Lawn** (same yard for everyone, today only).
- Gear arc: Old Faithful → self-propelled → wide-deck → riding mower (career unlocks,
  never money). Grass tiers change *technique*: T4 jungle needs the two-pass high-cut.
- Zones with names, per-zone ding, 97% mercy rounding, Last-Blade glow toggle.
- Discoveries in the tall grass: junk → The Jar, story items → returned via text,
  keepsakes → the Pegboard. Stripes from cut direction. Before/after postcard with
  a wipe slider + PNG export. Mid-job resume, autosaved every 8s (localStorage).
- All-procedural art + all-synth audio (engine load pitch, cicadas, the ding,
  3 generative radio stations). Zero asset files beyond three.js.

## Architecture (for future sessions)

- `mow/grass.js` — THE HEART. CPU-authoritative cut mask (8 texels/m, RGBA:
  cut-state / cut-direction / tier+flags). Mowing = stamping the mask; blades are
  chunked instanced quads whose vertex shader reads the mask; a ground-overlay
  shader gives distance readability + stripes; completion = incremental per-zone
  texel counts (never a rescan). Stamp events would sync trivially for future co-op.
- `mow/props.js` — procedural prop kit (~25 builders) + yard composer (ground canvas,
  fence, surround, sky, lights). Props register colliders, no-grass footprints, and
  trim rings (mower-blocked, trimmer-only).
- `mow/street.js` — everything beyond the fence: the five neighbour houses with their
  drives and mailboxes, traffic, parked cars, the arriving neighbour, sidewalk people and
  the birds. Pure view: built by game.js after the yard, ticked from `Game.frame()` only,
  and it never touches the mask, the player, collision or the save.
- `mow/game.js` — sim: movement/collision, tools, load→engine, zones/dings/mercy,
  discoveries (with off-grass relocation), rabbit/dog/fireflies, golden hour.
- `mow/yards.js` — ALL content as data. A job ≈ 40 lines. Daily Lawn generator.
- `mow/ui.js` + `index.html` — notebook meta-UI, HUD, texts, postcard compositor.
- `mow/sfx.js` — WebAudio synth; every continuous node tracked and stopped;
  headless-safe (no audio device → silent no-ops).
- `test/` — Playwright harness: `smoke` (loop), `visual` (screenshots), `alljobs`
  (every job boots→mows→completes; jungle-lever logic; resume round-trip).
  Debug hooks: `__fc.startJob/mowAll/stripes/teleport/look/state/drive/renderOnce/shot`.

**Verified 2026-08-08:** 24/24 jobs complete headlessly, 0 console errors across the
battery; resume byte-matches; jungle lever enforced; postcards render both sides.

## Invariants (do not break)

1. **No fail states.** Nothing can be damaged; no fuel/durability/money-per-job.
2. **The ding never stacks** (120 ms cooldown in `Game.update`).
3. Cut grass never un-cuts inside a job. Every second is banked.
4. Mercy: zones auto-round at ≥97%. Last Blade is a *toggle*, not sonar.
5. The finale (`pops`) locks Old Faithful, silences the radio, and stays quiet.
6. Story never blocks input. Texts are ignorable, always.

See `DESIGN_BIBLE.md` for the full design + the decision log.
