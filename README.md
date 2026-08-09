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
- `mow/game.js` — sim: movement/collision, tools, load→engine, zones/dings/mercy,
  discoveries (with off-grass relocation), rabbit/dog/fireflies, golden hour.
- `mow/yards.js` — ALL content as data. A job ≈ 40 lines. Daily Lawn generator.
- `mow/ui.js` + `index.html` — notebook meta-UI, HUD, texts, postcard compositor.
- `mow/sfx.js` — WebAudio synth; every continuous node tracked and stopped;
  headless-safe (no audio device → silent no-ops).
- `test/` — Playwright harness: `smoke` (loop), `visual` (screenshots), `alljobs`
  (every job boots→mows→completes; jungle-lever logic; resume round-trip).
  Debug hooks: `__fc.startJob/mowAll/stripes/teleport/look/state/drive`.

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
