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

## ⏭️ NEXT SESSION — the backlog is clear

Everything on the standing list is done: campaign heroes + palettes (v1.28), the mower pass
(v1.28), engine voices (v1.29), indoor rooms dressed and furnished (v1.30), the stats page
(v1.31), the indoor-surround bug (v1.32), the rooftop hospital (v1.33). Kyle explicitly
dropped the trailer pass (2026-08-12). **Next work should come from playtesting** — every
open item so far has come from either Kyle playing or a screenshot pass, not from the list.

## v1.33 (2026-08-12) — the hospital is THE building now

The last open visual item: on the roof at Vance & Co. the hospital hero was one slab among
slabs, and v1.29's big red cross didn't fix it. The note said the answer was to make the
ring towers plainer, not the hospital louder — half right. What actually did it:

- **The city ring towers stopped wearing the hospital's language.** They had pale HORIZONTAL
  window bands — exactly the hospital's dressing. Offices now wear **vertical curtain-wall
  glazing in dark glass** (inset from the ends, so their sides stay plain body), and the
  hospital is the only building on that skyline in pale bands. Differentiate the crowd, not
  the hero. Some towers get a rooftop plant box for a varied roofline.
- **The hospital faces the roof now.** It sits SOUTH of the lot, so its front — bands,
  entrance, the big cross — pointed at the horizon. `rot: 3.1416` in the rooftop hero def,
  plus a touch closer and bigger (x −30, z 44, s 1.1).
- **The ring keeps a clear yard around every hero** (`heroSpots` check in the ring loop,
  16 units). The ring is random and the heroes are authored, so a ring tower — or a
  3-scale tree on any other map — could land squarely in front of the landmark the map is
  named for. The hospital sits *inside* the city ring band; this is what guarantees its
  cross is visible at all, and every map's heroes benefit.

Verified by matched shots: the hospital reads instantly from the roof, the ring reads as
offices from two directions, and the duplex hospital (suburb) is unchanged. 44/44 jobs,
0 console errors.

## v1.32 (2026-08-12) — 🐛 there was a road, a pavement and five houses inside the lounge

Small room detail, which turned up a real bug on the way in.

**`'indoor'` was missing from the NON_RESIDENTIAL list in BOTH `props.js` and `street.js`.**
So each of the four indoor maps was being given the full outdoor surround: a tarmac road, a
**1.6 m pavement running across the room** between the carpet and the north wall, centre-line
dashes, five neighbour houses with driveways and mailboxes, parked cars, pedestrians and a
live traffic pool — the last of which was also being ticked every frame for scenery nobody
could see. Measured on the shag lounge: road 1, pavement 1, street layer **340 meshes → 10**.
- The remaining 10 are the bird flock, and they are fine: `visible = false` until they fly,
  and they fly at y 26+ and z −40, which is sky seen through the window. Checked, not assumed.
- ⚠️ The two literal lists must be changed together. They are deliberately not imported from
  hood.js (that would make props ↔ hood circular), so nothing enforces it.

**The floor is a floor now.** The surround aprons were grass-green under the furniture and up
to the skirting, so the carpet appeared to run on for ever and the room read as a lawn with
walls round it. Indoors they take `def.room.floor`: dark boards in the lounge, grey screed in
the club hall, worn parquet in the social club, pale lino in the kitchen — with a **threshold
strip** round the lot edge so the carpet visibly ends. Measured: lawn rgb(186,206,147),
threshold rgb(90,96,41), floor rgb(80,39,7).
- ⚠️ I read the first shot as "the floor is still green" and was **wrong** — the margin is 3.5
  units seen edge-on, so it is a thin band in a 640px thumbnail. The pixel probe settled it.
  Sample the render at projected world points; do not eyeball a strip.

**And the ceiling had a light on it and nothing else**: a ceiling rose round the pendant, a
loft hatch, a smoke alarm, plus a socket at skirting height and a radiator under the window
(the kitchen passes `radiator: false` — you do not put one under the sink window).

Verified: outdoor maps untouched (marge and commons still road 1, green aprons 4, street 340
and 323 meshes), 44/44 jobs, 0 console errors.

## v1.31 (2026-08-12) — The Numbers: the back page of the notebook

A fourth notebook tab, in Pop's voice: the page where he kept his tallies. **Every figure is
measured from the save** — a fresh save honestly reads near-zero rather than inventing a
career for you.

- **Four headline figures**: grass cut (m²), time on the clock, kilometres walked, pages
  inked — then *"that is 2.5 front lawns, at three hundred square metres a lawn,"* because
  a raw square-metre count means nothing to anybody.
- **The Books** — a progress row per book (Route / Odd Jobs / Wider Job Book / Odd Sizes).
- **The Tallies** — bags tipped, things found, junk in the jar, jobs where nothing was
  missed, best pattern score, trophies, and **"the one you reach for"** (the mower you have
  actually finished the most jobs with).
- **Page by Page** — every finished job with visits, best time, area, pattern and the mower
  you used.

**⚠️ The area was never being counted, which is odd for a mowing game.** The cut mask is
8 texels/m, so 64 texels is a square metre and `grass.cut` is already an exact running
count — `area: grass.cut / 64` in `_complete()`, folded into `lifetime.area`. Note it
reports the *grass*, not the lot: Marge's is 235 m² of a 20×15 plot, because the house, the
path and the beds are not lawn. That is the honest number and it should stay that way.

**⚠️ A repeat visit used to ERASE your best run.** `save.done[id]` was overwritten wholesale
on every completion. It now keeps the best (min time, max found/keeps/area/pattern) plus
`plays` and `last`. Verified both directions: a faster second run takes the record, and a
slower third run leaves a planted 12s best untouched while still counting the visit.

- `ensure()` back-fills `area` and `gearJobs` on old saves so nothing reads NaN.
- ⚠️ `wireNotebookTabs` now toggles `#nb-<tab>` generically instead of naming three ids by
  hand — which is exactly how a fourth page gets forgotten.
- ⚠️ Don't format the distance as `num(x/1000*10)/10`: `num()` runs `toLocaleString`, so past
  10,000 km the comma turns the divide into NaN. `(dist/1000).toFixed(1)`.

## v1.30 (2026-08-11) — the indoor rooms are rooms now

v1.19 shipped four walls, a ceiling and a skirting board and flagged them as "plain flat
walls: they read as indoors but want a window or picture rail to be good." v1.26 gave them
the window. This gives them everything else, via one `dressRoom()` in hood.js driven per map
from `def.room` — **a way out, something overhead making the light, and things hung at the
heights people hang things.**

- **A door** — architrave, leaf, two panels, a handle and a light switch beside it, on the
  west wall (`doorSide: 'e'` moves it). A room you cannot leave is a box with a rug in it.
- **The light fitting**, four kinds, authored per room: `dome` (the 1974 lounge's amber
  pendant on a visible flex), `strip` (the model railway club's fluorescent battens), `shade`
  (the social club's long low table shade) and `flush` (the kitchen ceiling light).
  ⚠️ The lamp is `brighten()`-ed to 0.62 and then tagged **`userData.keepMat`**, or the room's
  own brighten pass runs afterwards and stomps it back down to wall brightness — the same
  guard street.js uses for its window materials.
- **Framed pictures** at eye height, a **wall clock**, a **cornice** where wall meets ceiling,
  a **dark contact line** where it meets the floor, and **curtains** either side of the window
  so it reads as a window rather than a hole.
- ⚠️ **The snooker shade was a ceiling beam.** At `W*0.58` long and `wh*0.64` high it spanned
  half the room and filled the top of frame as a structural member. A lamp has to be small
  and high or it stops reading as a lamp: `min(W*0.34, 7)` at `wh*0.80`.
- ⚠️ **The clock rendered as a plain white disc** — the group was rotated π, which put the
  hands (at local −x) inside the wall. The face is symmetric; it needs no rotation.

Per-room character lives entirely in `def.room`: the shag lounge is brown with four gold
frames, the railway club is hall-green with five, the social club is bottle-green with its
door on the east wall, and Theo's kitchen is pale blue with almost nothing on the walls.

**And then the furniture** (`FURN` + `def.room.furn`), because a dressed room with nothing
standing in it is still a stage set. Eight pieces — `sideboard` `armchair` `tv` `trestle`
`shelf` `bench` `counter` `fridge` — placed by x/z in the **3.5-unit band between the edge of
the lawn and the wall**, which is the only floor a room has that isn't the mowable lot.
The lounge gets a sideboard, a boxy TV with an aerial, two armchairs and a bookcase; the
railway club gets trestle tables with crates on them; the social club gets bench seating;
Theo's kitchen gets base units and a fridge.

- ⚠️ **The player is hard-clamped to the lot** (`game.js` ~132), so none of this needs a
  collider, a no-grass footprint or a trim ring. It is pure view, like the room around it.
- ⚠️ **SCALE.** These rooms are a normal room seen by a mower-sized person: a 7-unit wall is
  about 2.4 m, so a unit is roughly a third of a metre and a sideboard is **2.2 units tall,
  not 1**. Built at s=1 for a 7-unit room; the shorter rooms pass s ≈ 0.85–0.95. The
  furniture is *meant* to loom — you are a doll mowing the carpet.
- ⚠️ The sideboard's drawer fronts sat at z 0.65 on a carcass whose face is at 0.625 — 25 mm
  proud, so they z-fought into invisibility and the piece rendered as a plain slab.
- ⚠️⚠️ **`node --check` REPORTED OK ON A BROKEN ES MODULE.** A patch left a room object with
  no comma before its `furn` key — `--check` passed it twice, and the real error only showed
  up on `import()`: *"Unexpected identifier 'furn'"*. **Validate these data files by importing
  them** (`node --input-type=module -e "import('./mow/goofy.js')…"`), not with `--check`.

## v1.29 (2026-08-11) — the machines sound like themselves, and the numbers are honest

**1. Seven machines, two kinds of engine voice.** v1.28 made them *look* different while
they all still sounded like the same small four-stroke. `ENGINE_VOICE` now carries a `kind`:

- **`petrol`** (push / self / wide / rider / titan) — pull-cord, putter AM, lowpassed thump.
  The Titan is a much bigger engine (42 Hz vs Old Faithful's 86) with a `cord: 1.7` multiplier
  that stretches the whole rip-sputter-settle ritual, because a big engine takes a long haul.
- **`electric`** (hover / tweezer) — **no cord and no putter**: two saws a hair apart so they
  beat, a low hum for body, moving air, and a *spin-up* instead of a cough. The Hover's air
  bed is 6× the Tweezers' (`airG` 0.30 vs 0.045) because the cushion is most of what you hear.
- New per-voice **`lug`** = how much this engine minds thick grass. Measured, wide-open →
  full load: Old Faithful drops **32%**, the Titan **18%**, the Hover **8.5%**, the Tweezers
  **7.7%** — a motor holds its note, a tired four-stroke bogs.
- Volume spread is 6.5× end to end (titan 0.72 → tweezer 0.11). You have to lean in to hear
  the Tweezers, which is the joke.
- `engineStop` now walks a `nodes` array instead of five named oscillators, and the load
  response lives in the engine object as `set(load, speed)` — so adding a third kind of voice
  doesn't mean touching `engineSet`. QA: `sfx.engineDebug()` returns kind/types/frequencies.

**2. What the skyline actually costs — measured, with a validated probe.** `__fc.heroCost()`
toggles every `userData.hero` group and times it with `EXT_disjoint_timer_query_webgl2`:

| map | heroes | draw calls | triangles | GPU time |
|---|---|---|---|---|
| Hazel Park Commons | 3 | **+44** (of 447) | **+936** (of 179,264) | below noise |
| Marge's Place | 2 | +25 (of 1006) | +322 (of 85,389) | below noise |
| Water Tower Hill | 3 | +37 (of 640) | +964 (of 158,474) | below noise |

- ⚠️ **`renderer.info` is reset on every `render()` call**, and post.js runs several passes
  per frame — so reading it after `drawFrame` reports the *composite quad alone* (1 call, 2
  triangles) and makes the entire scene look free. `info.autoReset = false` + a manual reset
  gives real totals. The first run of this probe reported 1 draw call and I nearly believed it.
- ⚠️ **The probe carries a CONTROL: it hides the whole scene and asserts the time collapses**
  (it does — 6.3 ms → 0.11 ms). Without that check a dead timer reads as "free", which is
  exactly the bad measurement v1.9 warns about.
- The honest verdict is **"below the noise floor"**, not a millisecond figure: frame time in
  this software-GL browser pane swings 7–12 ms, which is far wider than any difference three
  buildings could make. The geometry numbers above are exact; the time is not measurable here.

**3. `__fc.battery()` — the job battery lives in the repo now.** It was being retyped into
the console every session. It boots → mows → completes every job, **cycling the gear** (a
mower that fails to build only shows up if something other than `push` gets used), and checks
deck alignment, bag, hero and palette per job. `await __fc.battery({log: true})` prints a
table. `test/alljobs.mjs` is now a thin CI wrapper around that same function — it takes
`PORT` and `PW` from the environment instead of hardcoding port 8437 and a Linux Playwright
path, and it exits non-zero on failure. If the two ever disagree, the one in main.js is real.

**4. Two heroes were weaker than the rest; one is fixed and one is honest.**
- ⚠️⚠️ **The grain elevator read as a GREEK TEMPLE**, on two maps, for two versions — six pale
  cylinders in a row under a slab wider than it is tall *is* a portico. **My first fix made it
  worse**: I added a skirt across the silo bases, which reads as a stylobate. What actually
  killed it was **proportion, not detail** — fewer, slimmer, much taller silos (21 m wide ×
  30 m tall instead of 31 × 22), a headhouse that is taller than it is wide and spans only the
  middle, and dirty concrete instead of marble. Verified on delgado and orchard.
- The hospital's window bands are the same language the city ring towers wear. It now carries
  a **big red cross on the face you actually see** (plus one on the flank, a helipad and a lit
  mast). On the duplex it reads instantly; on the rooftop it is still one slab among slabs.

**5. A real playtest, with real input.** Driving lanes from spawn with `__fc.drive` rather
than teleporting: **43 sim-seconds of continuous mowing cuts ~5% of Marge's lawn**, so a full
page is roughly 15 minutes of solid work, and the bag fills about every 3–4 minutes. The
alternation works — mowing "up" a lane you face the hero, mowing back down you face the
street. ⚠️ Detail on the machine below about 5 cm does **not** read while playing; what carries
is silhouette, deck colour and the engine hump. Worth knowing before spending more on it.

## v1.28 (2026-08-11) — the town has a skyline, and seven machines instead of one

**1. Every job in the original campaign has a `hero` and a `palette`** — the 19 notebook
pages, the 4 Odd Jobs, the 10 Wider Job Book maps (they had the same gap; README v1.13
flagged it) and the Daily Lawn, which rolls one of each from its seed.

Nine new hero kinds in hood.js, deliberately **quiet**: `tower` (the water tower),
`church` (nave, belfry, clock, spire), `elevator` (grain elevator + headhouse + conveyor
gallery), `mill` (brick mill and the chimney you steer by), `hospital`, `civic` (town hall,
portico, clock cupola, dome), `school` (brick, two storeys, a bell nobody rings), `bridge`
(steel truss) and `radio` (lattice mast, guy wires, the red light that is on all night).
Hazel Park has **one of each**, so the same spire and the same tower recur from yard to
yard at different bearings — which is what living somewhere actually looks like.

- ⚠️ **Distance is the whole game with these.** A neighbour's roof is ~6 m at ~23 m, so a
  hero past ~85 m needs to be over 22 m tall just to peek over the rooftops, and the first
  placement pass (78–96 m) left most of them as a spire tip in a gap. Forward heroes now
  sit at **40–70 m** and rear heroes at **38–46 m**. Measure the clearance, don't eyeball it.
- ⚠️ **`def.palette` gained `arc: true`.** A hard palette (what the Odd Sizes use) would have
  eaten the **golden hour**, which is the finish's whole gift — completion sets `warm = 1`
  and the day preset walks to gold, but a palette is applied last and wins. An `arc` palette
  is the *cool end of a day*: applyLightPreset lerps it toward the same warm targets by
  `warm`. Verified numerically — marge #f4f8ff → #fdd6ae at warm 1, while shag (no `arc`)
  is byte-identical at warm 0 and warm 1.
- 🐛 **Fixed: indoor maps built no heroes at all.** v1.26 opened a real window in the north
  wall of the indoor rooms, but `buildHood`'s indoor branch **returns before the hero loop**,
  so the shag lounge, the snooker room, the model railway and the windowsill all looked out
  at nothing. The loop is now `buildHeroes()` and both paths call it.
- 🐛 **Fixed: `Object3D.add()` returns the PARENT.** `g.add(cone(...)).rotation.x = Math.PI`
  rotated the whole water tower under the ground — invisible, and it looked exactly like the
  hero had never been built. There are three other places in this file that chain off `add`;
  don't add a fourth.
- 🐛 **Water Tower Hill had no water tower.** Same class of bug as the Putt Hutt's missing
  windmill (v1.13): the map was named for a thing that was never built. It has one now, at
  `s: 1.3` and close enough that you look up at it.

**2. The mowers (`makeMower`) — seven machines that read as seven machines.** They shared one
box-with-wheels body and differed only in colour and width.

| gear | what it now is |
|---|---|
| Old Faithful | the tired one: 5 rust patches on the deck **and down its sides**, a bent muffler, a faded badge, taped grips, a dent nobody hammered out |
| The Self-Propelled | a **drive belt cover** along the deck top, an axle housing and pulley, bigger rear wheels, and the **drive bail** hooped over the grip |
| The Wide-Deck | commercial: **two spindles**, a second handle brace, rubber hand pads, a bigger chute |
| The Titan | a walk-behind the size of a door: **twin drive levers** and a control panel with a kill switch, not a push bar; 3 spindles; knobbly drive wheels |
| The Hover | **no wheels, none** — a shell on a skirt with a fan intake, one pole to a loop grip, riding 7 cm off the grass, and a pouch instead of a bag |
| The Tweezers | not really a mower: a 22 cm head, a blade disc, a work light, a slim wand to a pistol grip, a battery pack and a collection cup |
| The Rider | a small tractor at last: bonnet, grille, headlamps, exhaust stack, steering column, **a seat with a back**, fenders, footplate, anti-scalp rollers and a deck-lift lever |

Plus, on every walk-behind: **height-adjust levers** (notched quadrant, raked lever, red
knob) at each wheel, a **throttle cable** clipped up the right handle tube from the engine
to the lever under the grip, and a **duct** from the deck into the bag mouth.

- ⚠️ **No full-width plate on the deck top.** The first pass laid a dark plate over the whole
  deck and hid the paint — which is an *earned reward* (`save.paint`) — so the machine read
  as one grey blob. Only a rim rail and the engine's own plate sit up there now.
- ⚠️ **Height levers go OUTBOARD of the deck.** Tucked inboard they sat *inside* the deck box
  and all you ever saw was the red knob poking through the paint.
- The contract with game.js is unchanged and is the thing to preserve: `deckLocal`,
  `bag`, `bagLocal`, and `userData.wheel` on anything that should roll. Verified across all
  seven: deck alignment exact, bag fill→dump on each (push 1, hover 2, titan 4, rider 3
  dumps on a scripted mow with a reduced cap).

**3. `__fc.shoot(name, port, w, h)` and `__fc.gl()`** — the screenshot recipe is now IN the
game instead of being re-derived every session. The Browser pane never composites this
canvas, so size + render + `toDataURL` **in one task** is the only thing that returns real
pixels; `shoot` POSTs the PNG to `tools-shot-receiver.mjs` (workspace root, run it with the
portable node and pass a port). ⚠️ Mow a patch at the camera first or the foreground is a
wall of grass.

**Verified: 44/44 jobs boot → mow → complete, 0 console errors**, deck alignment exact on
every gear, bag round-trips, and the golden hour still lands on maps that now have their own
light.

## v1.14 – v1.19 (2026-08-11) — backdrops, a fourth book, and pattern scoring

**v1.14 — backdrops match the location.** Five non-residential hood archetypes
(`parkland`, `openfield`, `water`, `city`, `orchardland`) with `residential: false`, which
skips hood.js's side and rear neighbours. ⚠️ **The catch:** the houses out front come from
**street.js**, not hood.js — it builds a road, five houses, traffic, parked cars and
pedestrians for every map. Gating hood.js alone left a suburban street with a passing
pickup in front of the reservoir. street.js now carries its own `NON_RESIDENTIAL` list,
and props.js skips the road/pavement planes via the same literal list (kept literal rather
than importing hood.js, which would make props ↔ hood circular).

**v1.15 — map identity.** `def.paths` gained `c` (a colour); that one field bought the
speedway's dirt oval and Cutter Field's base paths. New props `parapet` (a roof reads as a
lawn without one) and `backstop`. ⚠️ Reservoir water raised to y −0.012 — **above** the
surround aprons at −0.03, which were showing *through* it as a green band.

**v1.16 — pattern scoring.** `grass.patternStats(nZones)` runs circular statistics over the
cut-direction channel: `neatness` = mean resultant length per zone (⚠️ **plain averaging of
angles is wrong** — 359° and 1° average to 180°; the vector sum handles the wrap),
`alternation` = share of neighbouring bands whose mean directions oppose. Score = 65%
neatness + 35% alternation. **Praise only — it cannot fail or gate a job** (invariant 1).
Measured: alternating bands **96**, one-directional **65** (neat but not striped — the
honest reading), wandering **22**. Maps opt in with `pattern: true`.

**v1.17 — the score on the postcard.** A circular stamp drawn in `drawPostcard` (module
`pcPattern`, set in `renderComplete`) so it survives into the saved PNG, plus a caption
tail. ⚠️ **Speedway dirt oval fixed:** it was at z 1.5/19.1 — the *outer* face of the
banking, which from a camera down in the infield sits beyond the crest and is invisible
however wide you make it. Moved to the inner face, which is also what a real banked oval
looks like from the middle.

**v1.18 — THE ODD SIZES (`mow/goofy.js`, block 6).** A fourth book: ten absurd-scale maps
in the game's own deadpan voice — nobody in it knows they are being funny. ⚠️ Absurd scale
was nearly free because the prop loop already honours `s`: a gnome at `s: 9` is three
storeys, a tree at `o.s: 0.16` is a model-railway shrub. New gear locked per map: **the
Titan** (swath 2.2, slow), **the Hover** (0.95, no bob), **the Tweezers** (0.20).

**v1.19 — Odd Sizes backdrops.** `indoor` (four walls, ceiling, skirting; returns early so
there is no ring, no landmark and no sky — a sunken lounge has no horizon) and `giant`
(houses 30–52 m wide, `ringTreeScale` 9). ⚠️ The indoor rooms are still plain flat walls:
they read as indoors but want a window or picture rail to be good.

⚠️ **ui.js filters three book flags out of the campaign count** (`!j.odd && !j.tour &&
!j.goofy`). Any future book must be added there or the "pages inked" counter inflates.

**44 jobs across four books. All complete, 0 console errors.**

## v1.13 (2026-08-11) — THE WIDER JOB BOOK: ten new maps

A second campaign (`mow/tour.js`, block 5, `tour: true`), unlocked from the start. Ten
grounded-but-characterful places, every one using the heightfield, built around the three
mechanics Kyle picked: **shaped ground, patterns, trimmer-forward**.

| map | the hook | shape |
|---|---|---|
| The Bellamy Maze | 1931 hedge maze — the deck does not fit, this is the trimmer's day | crowned lawn |
| Hazel Park Speedway | mow the banking of a dirt oval, across the slope not up it | two 1.9 m banks + sunk infield |
| The Reservoir Bank | the steepest thing in the game; the town's drinking water is behind it | 3.55 m earthen bank |
| The Old Quarry Steps | four limestone terraces, each flat as a table | three `step` features, 4.2 m total |
| The Roof at Vance & Co. | a lawn six floors up, threaded between vents and planters | roof falling to its drains |
| Cutter Field | a real ballpark: six alternating bands, and it's on the news Friday | outfield crown |
| The Ninth at Ridgeway | municipal golf; humps, a hollow, and a green you do last and slow | 4 mounds + a bowl |
| The Fairground, Monday | the fair left Sunday; mow the ride pads before they set that way | two pressed hollows |
| The Vesper Orchard | eleven rows on a south slope, ninety-odd trunks by hand | hillside + rise |
| The 3AM Contract | a field, a time, and a shape drawn on an envelope | five mounds and a ring |

Also **fixes a silent pre-existing bug**: the Odd Jobs referenced prop kinds nobody ever
built (`windmill`, `holeflag`, `gravestone`) — `PROPS[p.k]` returned undefined and the
loop skipped them, so the Putt Hutt had no windmill and no flags and the cemetery had no
headstones. Those three now exist, along with `hedgewall`, `bleacher`, `tyrestack`,
`statue`, `fountain`, `acunit` and `booth`.

Verified: **34/34 jobs complete at 100%**, all ten carry terrain, 0 console errors.
⚠️ Not yet done: a visual/framing pass over the ten (they verify functionally but haven't
been art-directed), and pattern *scoring* — the band layouts shape how you mow, but nothing
yet measures how well you matched a pattern.

## v1.12 (2026-08-11) — `mow/terrain.js`: the ground has shape

The foundation for the new campaign of unusual maps. A lot can now have mounds, hollows,
banks and a tilt, and everything standing on it reads its height from one place.

**Two rules make this safe to drop into a shipped game:**
1. **`def.terrain` absent → `heightAt()` is a constant 0 and `enabled` is false.** Every
   existing map stays exactly flat and pays nothing. Verified: **24/24 existing maps still
   flat**, 24/24 still complete, 0 console errors.
2. **Height tapers to zero at the lot boundary**, so the fence, the street and the whole
   neighbourhood beyond never need to know terrain exists. It also levels off under the
   house pad and any laid path, with a soft skirt, so buildings don't sit on a slant.

Features: `mound`, `bowl`, `ridge` (a bank/levee along a line), `step` (a terrace), `slope`.

What follows the ground: the ground mesh and the cut overlay are subdivided and draped
(2 segments/m); **grass blades and flowers bake their height into a per-instance `aY`
attribute** — they're static, so this costs nothing at runtime and can never drift (max
error measured **0**); props stand at their ground height; the player has a real `p.y`;
the camera rides it; clippings fall to the ground they came from; and the mower **lies
along the slope**, pitching from the gradient ahead and rolling from the gradient across.

## v1.11 (2026-08-11) — `mow/hood.js`: the world on all four sides

street.js owned the road in front; everything else was bare green plane. Now every lot has
neighbours left and right (fronts to the street, with trees, sheds and boundary hedges),
the **backs** of the next street's houses behind you (back gardens, sheds, washing lines,
a hedge line), a horizon ring of roofs and treelines in every direction, and one landmark
on the skyline. Measured looking four ways from the middle of a lot: **12–20% bare sky**
in the horizon band, where behind and to the sides used to be empty.

**Five archetypes, authored per job in `JOB_HOOD`**, so the block suits the map:

| archetype | jobs | reads as |
|---|---|---|
| `suburb` | marge, twins, coach, duplex, hendersons, rental, gary, pops, terrarium | the classic block |
| `oldtown` | missvi, bell, foreclosure | older, denser, brick, big mature trees, a spire |
| `main` | bakery, corner, commons | town strip: flat roofs, parapets, awnings, few trees |
| `rural` | delgado, creek, church, watertower | wide gaps, barn, silo, treeline instead of a skyline |
| `edge` | outfield, putthutt, cemetery, drivein | civic/open, sparse, floodlight masts |

`def.hood` overrides per job. Horizon ring halves on Low quality. 24/24 jobs, 0 errors.

## v1.10 (2026-08-11) — the invisible walls around the house

"There are invisible walls around the houses so you can't get right up to the edges."

The house was approximated by a **row of circles** whose radius was its half-**depth**
(`r = HD/2 + 0.25`). A circle bulges in every direction, so those circles stuck out past
the ends of the building by roughly that radius minus their spacing — nearly two metres of
unmowable ground off each end. Measured by driving at the house from 16 directions and
recording how close the deck lip got:

```
old circles: 0.10 … 1.95 m   (the 1.45/1.95 readings are exactly at the house ENDS)
new rects:   0.08 … 0.16 m   uniform all the way round     improvement: 1.79 m
```

- `world.rects` is a new collider type resolved against the closest point on the
  rectangle, so a building collides as its actual footprint with 8 cm of margin. The
  trimmer now reaches the wall (gap 0) from all 16 directions.
- ⚠️ **The porch stays a CIRCLE on purpose.** As a rect it butted against the house rect,
  and two touching rects resolved in sequence shove the body back and forth between them —
  it settled *inside*. Measured 60 stuck cases. One rect plus one circle cannot do that:
  re-measured at **0 ticks inside a wall** across 17 houses × 24 approach angles × 200
  ticks.
- ⚠️ Escape-if-inside is decided **once, from the body**, never per probe: the body and
  the mower nose sit at different depths, so each picking its own nearest wall made them
  push opposite ways.
- The remaining ~0.9 m gap on the front arc is the porch itself, which really is there.
  Worst gap anywhere else: 0.28 m. 24/24 jobs, 0 console errors.

## v1.9 (2026-08-11) — the art pass: light, weather and small living things

- **`mow/post.js`** — a finishing pass: bloom on genuinely bright things, a colour grade
  that warms with the afternoon, a little saturation, a soft vignette. Toggle in settings
  ("Sunlight glow"), auto-off on Low quality or without WebGL2. The postcard renders
  through it too.
  ⚠️ **It hangs on one three.js fact**: tone mapping is applied only when the render target
  is the canvas. The scene lands in the HDR target as LINEAR light and the *composite*
  applies ACES + sRGB itself (`#include <tonemapping_fragment>` / `<colorspace_fragment>`,
  needing `material.toneMapped = true`). That is why the base look is preserved instead of
  graded twice — intermediates set `toneMapped = false`.
  ⚠️ `sceneRT.samples = 4`, or post silently costs you the canvas's MSAA.
  ⚠️ `threshold` is LINEAR and this is a bright world — too low and the **lawn** glows.
- **Cloud shadows** — `CLOUD_GLSL` in grass.js, shared by the blades, the ground overlay
  and the flowers so they darken as one patch. ⚠️ The first version MULTIPLIED two warped
  sines, which clusters the field around 0.5: measured only **3–23%** of the lawn ever in
  shadow. Summing them instead gives an even field — **25–32% shaded at any moment** with
  the overall brightness steady (mean swing 0.017), so patches visibly cross rather than
  the whole yard pulsing. ⚠️ The overlay must sample at `(vUv.x, 1-vUv.y) * lot` or its
  shadow slides opposite the blades' (same flip as the v1.6 mask bug).
- **Wildflowers that mow away** — dandelions, clover and daisies on instanced crossed
  quads, placed only on tier ≥ 2 grass. The vertex shader collapses an instance the moment
  its texel reads CUT, so removing them costs the CPU nothing and can never desync from the
  cut. ~750 per yard. Verified by mesh-visibility diff: **663 flower pixels before mowing,
  2 after**, and 0 of 306 instances still passing the mask rule.
- **`mow/life.js`** — bees and butterflies that wander toward the parts still long and
  **scatter from the running deck**, ~190 pollen motes drifting (brighter at golden hour),
  and wind sway on every leafy prop canopy, driven by the same gust shape the grass shader
  uses so the yard breathes together.
- **Clouds** are much bigger and roughly 2.5× faster now, all three layers.

View-only, all of it: `life.js` ticks from `Game.frame()` like street.js, so headless jobs
run no insects. 24/24 jobs, 0 console errors.
⚠️ Don't trust wall-clock timing for GPU cost here — measuring post on/off that way
reported post as *faster*, which is impossible. Use `EXT_disjoint_timer_query_webgl2` if a
real number is ever needed.

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
   ⚠️ **Re-affirmed by Kyle 2026-08-11, explicitly.** The question was raised directly —
   money for jobs and a hardware store — and the answer was no. Rewards are earned by
   doing the work: trophies (The Shelf), earned mower paint, and career gear unlocks.
   **There is no wallet in this game.** Do not add one; this was decided on purpose.
2. **The ding never stacks** (120 ms cooldown in `Game.update`).
3. Cut grass never un-cuts inside a job. Every second is banked.
4. Mercy: zones auto-round at ≥97%. Last Blade is a *toggle*, not sonar.
5. The finale (`pops`) locks Old Faithful, silences the radio, and stays quiet.
6. Story never blocks input. Texts are ignorable, always.

See `DESIGN_BIBLE.md` for the full design + the decision log.
