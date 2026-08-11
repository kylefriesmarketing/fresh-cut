// FRESH CUT — tour.js
// THE WIDER JOB BOOK: ten places that are not somebody's front lawn.
//
// Grounded but characterful — every one of these plausibly exists within an hour of Hazel
// Park. The variety is carried by three things, per Kyle's brief:
//   1. SHAPED GROUND — every map uses terrain.js. Banks, crowns, terraces, bowls.
//   2. PATTERNS — zones laid out as bands/quarters you mow in sequence, so the stripe
//      direction you leave behind is the point (the cut-direction channel already does the
//      work; these maps are shaped to show it off).
//   3. TRIMMER-FORWARD — mazes, headstones, planters and tree rows where the deck can't go.
export const TOUR = [
  {
    id: 'hedgemaze', block: 5, tour: true, name: 'The Bellamy Maze', client: 'Bellamy House & Gardens', who: 'MRS. ADEYEMI',
    blurb: "A hedge maze planted in 1931 and trimmed by one man until last spring. The paths are grass. The walls are not. Nothing in here is wide enough for the deck and everyone knows it — bring the trimmer and bring patience.",
    pop: 'mind the walls',
    lot: { w: 28, h: 20 }, seed: 601, fence: 'rail', gate: { x: 13.5, w: 1.6 }, hood: 'oldtown',
    terrain: { features: [{ k: 'mound', x: 14, z: 10, r: 13, h: 0.55 }] },   // the old lawn crowns for drainage
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 11, z: 8, w: 6, h: 5, tier: 4 }],
    props: [
      ...[[4, 4, 10, 0], [24, 4, 10, 0], [4, 16, 10, 0], [24, 16, 10, 0]].map(([x, z, l, r]) => ({ k: 'hedgewall', x, z, rot: r, o: { l } })),
      ...[[9, 3, 8, 1.571], [19, 3, 8, 1.571], [9, 17, 8, 1.571], [19, 17, 8, 1.571]].map(([x, z, l, r]) => ({ k: 'hedgewall', x, z, rot: r, o: { l } })),
      { k: 'hedgewall', x: 14, z: 5.5, rot: 1.571, o: { l: 7 } },
      { k: 'hedgewall', x: 14, z: 14.5, rot: 1.571, o: { l: 7 } },
      { k: 'hedgewall', x: 9.5, z: 10, rot: 0, o: { l: 5 } },
      { k: 'hedgewall', x: 18.5, z: 10, rot: 0, o: { l: 5 } },
      { k: 'statue', x: 14, z: 10 }, { k: 'bench', x: 14, z: 12.6, rot: 3.14 },
      { k: 'planter', x: 11.6, z: 6.4 }, { k: 'planter', x: 16.4, z: 6.4 },
    ],
    zones: [
      { x: 0, z: 0, w: 28, h: 6, name: 'The Outer Walk' },
      { x: 0, z: 6, w: 11, h: 8, name: 'The West Turns' },
      { x: 17, z: 6, w: 11, h: 8, name: 'The East Turns' },
      { x: 11, z: 6, w: 6, h: 8, name: 'The Centre' },
      { x: 0, z: 14, w: 28, h: 6, name: 'The Long Return' },
    ],
    disc: [
      { x: 13.2, z: 9.1, tier: 'story', kind: 'glasses', label: "A pair of reading glasses, 1970s frames", text: "Those are Arthur's. He trimmed this maze for forty-one years and swore he'd lost them in 1988. Put them on the bench. He'd like that." },
      { x: 2.4, z: 18.6, tier: 'keep', kind: 'key', label: 'A brass key, no door left to fit it' },
    ],
    junk: 7,
    texts: {
      arrive: "You'll want the trimmer. I'd say start at the outside and work in, but Arthur always did the centre first so he had somewhere to sit.",
      mid: [{ pct: 55, t: "You've found the middle, then. Most people give up at the west turns." }],
      reply: "Forty-one years and then a spring of nothing. It looks like a maze again instead of a hedge with regrets. Come back in August.",
    },
  },
  {
    id: 'speedway', block: 5, tour: true, name: 'Hazel Park Speedway', client: 'Speedway Association', who: 'DUTCH',
    blurb: "A quarter-mile dirt oval with a grass infield and banking they cut into the hillside in 1962. You are mowing the banking. Yes, on the slope. Dutch says the mower has done it before and the mower has never complained.",
    pop: 'watch the banking',
    lot: { w: 34, h: 24 }, seed: 602, fence: 'chain', gate: { x: 16.5, w: 2.0 }, hood: 'edge',
    terrain: { features: [
      { k: 'ridge', x1: 4, z1: 4, x2: 30, z2: 4, w: 5.0, h: 1.9 },
      { k: 'ridge', x1: 4, z1: 20, x2: 30, z2: 20, w: 5.0, h: 1.9 },
      { k: 'mound', x: 17, z: 12, r: 12, h: -0.5 },
    ] },
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 0, z: 0, w: 34, h: 7, tier: 3 }, { t: 'rect', x: 0, z: 17, w: 34, h: 7, tier: 3 }],
    props: [
      { k: 'bleacher', x: 8, z: 2.2, o: { w: 7, rows: 5 } }, { k: 'bleacher', x: 24, z: 2.2, o: { w: 7, rows: 5 } },
      { k: 'tyrestack', x: 3.2, z: 8 }, { k: 'tyrestack', x: 3.2, z: 16, o: { c: 0xc0392b } },
      { k: 'tyrestack', x: 30.8, z: 8, o: { c: 0xf2c14e } }, { k: 'tyrestack', x: 30.8, z: 16 },
      { k: 'flagpole', x: 17, z: 22.4 }, { k: 'hydrant', x: 5, z: 22 }, { k: 'wheelbarrow', x: 29, z: 21.6, rot: 0.7 },
    ],
    zones: [
      { x: 0, z: 0, w: 34, h: 7, name: 'The North Banking' },
      { x: 0, z: 7, w: 12, h: 10, name: 'Turn Three Infield' },
      { x: 12, z: 7, w: 11, h: 10, name: 'The Infield' },
      { x: 23, z: 7, w: 11, h: 10, name: 'Turn One Infield' },
      { x: 0, z: 17, w: 34, h: 7, name: 'The South Banking' },
    ],
    disc: [
      { x: 17.4, z: 12.6, tier: 'story', kind: 'medal', label: 'A trophy plate: HAZEL PARK 100, 1974', text: "Well I'll be. That's Ronnie Vance's plate. He led that race for ninety-eight laps. Put it in the tower, kid, we'll clean it up." },
      { x: 32.2, z: 3.4, tier: 'keep', kind: 'cap', label: 'A pit crew cap, oil-stained, adjustable' },
    ],
    junk: 8,
    texts: {
      arrive: "The banking's the job. Take it across the slope, not up it — the deck rides better and so do you. Infield's flat, save it for when your legs are done.",
      mid: [{ pct: 60, t: "Looking like a racetrack again. First heat's in three weeks." }],
      reply: "Both bankings and the infield. Ronnie's plate is going up in the tower where it should've been for fifty years. You've got a seat any Friday you want it.",
    },
  },
  {
    id: 'reservoir', block: 5, tour: true, name: 'The Reservoir Bank', client: 'Hazel Park Water District', who: 'RAY (UTILITIES)',
    blurb: "The earthen bank that holds back the town's drinking water. Grass keeps it from washing out, so it gets cut twice a summer whether anyone's watching or not. It is the steepest thing you will mow and the view from the top is the best in the county.",
    pop: 'the whole county',
    lot: { w: 32, h: 22 }, seed: 603, fence: 'none', gate: { x: 3, w: 2.0 }, hood: 'rural',
    terrain: { features: [
      { k: 'ridge', x1: -2, z1: 15, x2: 34, z2: 15, w: 9.0, h: 3.4 },
      { k: 'slope', ang: 0, h: 1.2 },
    ] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 0, w: 32, h: 8, tier: 2 }],
    props: [
      { k: 'hydrant', x: 4.4, z: 19.4 }, { k: 'bench', x: 16, z: 19.2, rot: 3.14 },
      { k: 'shed', x: 28.4, z: 3.2, rot: 0.4 }, { k: 'stump', x: 8.6, z: 5.2 },
      { k: 'flagpole', x: 27, z: 19.6 },
    ],
    zones: [
      { x: 0, z: 0, w: 16, h: 8, name: 'The Low Meadow (west)' },
      { x: 16, z: 0, w: 16, h: 8, name: 'The Low Meadow (east)' },
      { x: 0, z: 8, w: 11, h: 6, name: 'The West Face' },
      { x: 11, z: 8, w: 11, h: 6, name: 'The Middle Face' },
      { x: 22, z: 8, w: 10, h: 6, name: 'The East Face' },
      { x: 0, z: 14, w: 32, h: 8, name: 'The Crest Path' },
    ],
    disc: [
      { x: 15.6, z: 16.4, tier: 'story', kind: 'photo', label: 'A photograph, curled: the bank under construction', text: "Nineteen fifty-one. That's my father third from the left with the shovel. He always said they built it to last a hundred years. Fifty-one down." },
      { x: 30.4, z: 20.6, tier: 'keep', kind: 'arrowhead', label: 'An arrowhead, older than the reservoir by a lot' },
    ],
    junk: 6,
    texts: {
      arrive: "Across the face, never up and down — that's the whole trick and it's the only rule I've got. Crest last. Take the view when you get there, everybody does.",
      mid: [{ pct: 70, t: "You're on the crest. Turn around and look at the town. That's what the bank's for." }],
      reply: "Both faces and the crest, and you didn't slide once. Dad's photo goes in the district office. Same time next year, if you'll have us.",
    },
  },
  {
    id: 'quarry', block: 5, tour: true, name: 'The Old Quarry Steps', client: 'Hazel Park Historical Society', who: 'DR. LIM',
    blurb: "They stopped cutting limestone here in 1949 and the town planted grass on the terraces to stop the dust. Four steps, each one flat as a table, each one a different distance from the last. Nobody has mowed the bottom terrace since the society took it over.",
    pop: 'four flat tables',
    lot: { w: 30, h: 24 }, seed: 604, fence: 'rail', gate: { x: 14, w: 1.8 }, hood: 'rural',
    terrain: { features: [
      { k: 'step', x1: 0, z1: 6.5, x2: 30, z2: 6.5, w: 2.2, h: 1.5 },
      { k: 'step', x1: 0, z1: 12.5, x2: 30, z2: 12.5, w: 2.0, h: 1.4 },
      { k: 'step', x1: 0, z1: 18.0, x2: 30, z2: 18.0, w: 2.4, h: 1.3 },
    ] },
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 0, z: 0, w: 30, h: 6, tier: 4 }],
    props: [
      { k: 'statue', x: 15, z: 21.2, o: { c: 0x9aa0a6 } },
      { k: 'bench', x: 6, z: 20.6, rot: 3.14 }, { k: 'bench', x: 24, z: 20.6, rot: 3.14 },
      { k: 'stump', x: 4.2, z: 9.4 }, { k: 'stump', x: 26.8, z: 15.2 },
      { k: 'shrub', x: 9, z: 13.8 }, { k: 'shrub', x: 21, z: 8.2 },
    ],
    zones: [
      { x: 0, z: 0, w: 30, h: 6.5, name: 'The Bottom Terrace' },
      { x: 0, z: 6.5, w: 30, h: 6, name: 'The Third Step' },
      { x: 0, z: 12.5, w: 30, h: 5.5, name: 'The Second Step' },
      { x: 0, z: 18, w: 30, h: 6, name: 'The Top & The Marker' },
    ],
    disc: [
      { x: 3.8, z: 2.4, tier: 'story', kind: 'fossil', label: 'A fossil in a broken block of limestone', text: "Three hundred and fifty million years, and it spent the last seventy under a foot of grass. That goes in the case by the door. Thank you." },
      { x: 27.6, z: 4.2, tier: 'keep', kind: 'trowel', label: "A quarryman's marking tool, handle worn smooth" },
    ],
    junk: 7,
    texts: {
      arrive: "One terrace at a time, bottom to top. The bottom is the worst of it — nobody's been down there in three years and it shows.",
      mid: [{ pct: 45, t: "That's the bottom done. It hasn't looked like that since the society took it on." }],
      reply: "Four terraces, clean as tables. The fossil's in the case with a card that says where it was found. You're in the minutes, formally.",
    },
  },
  {
    id: 'rooftop', block: 5, tour: true, name: 'The Roof at Vance & Co.', client: 'Vance & Co. Building', who: 'PRIYA (FACILITIES)',
    blurb: "Six floors up, a lawn the size of a tennis court, laid over the roof of the old mill offices because someone read an article in 1998. It has planters, vents, a very short parapet, and the best breeze in town. The mower came up in the freight lift and it is going back down the same way.",
    pop: 'six floors up',
    lot: { w: 22, h: 16 }, seed: 605, fence: 'rail', gate: { x: 2.4, w: 1.6 }, hood: 'main',
    terrain: { features: [{ k: 'mound', x: 11, z: 8, r: 11, h: 0.35 }] },   // the roof falls away to its drains
    tiers: [{ t: 'base', tier: 2 }, { t: 'rect', x: 14, z: 9, w: 8, h: 7, tier: 3 }],
    props: [
      { k: 'acunit', x: 4.2, z: 3.0 }, { k: 'acunit', x: 7.4, z: 3.0 }, { k: 'acunit', x: 18.6, z: 12.6, rot: 1.2 },
      { k: 'planter', x: 3.0, z: 8.0 }, { k: 'planter', x: 3.0, z: 10.4 }, { k: 'planter', x: 3.0, z: 12.8 },
      { k: 'planter', x: 19.2, z: 3.4 }, { k: 'planter', x: 19.2, z: 5.8 },
      { k: 'chair', x: 11.2, z: 13.4, rot: 3.0 }, { k: 'chair', x: 12.8, z: 13.6, rot: 3.3 },
      { k: 'flowerbed', x: 11, z: 2.6 },
    ],
    zones: [
      { x: 0, z: 0, w: 11, h: 8, name: 'The Vent Side' },
      { x: 11, z: 0, w: 11, h: 8, name: 'The North Parapet' },
      { x: 0, z: 8, w: 11, h: 8, name: 'The Planter Run' },
      { x: 11, z: 8, w: 11, h: 8, name: 'The Long Corner' },
    ],
    disc: [
      { x: 12.2, z: 13.0, tier: 'story', kind: 'ring', label: 'A wedding ring, under the second chair', text: "Oh my god. That's Denise's — she's been telling that story at every Christmas party for eleven years. She is going to LOSE it. In the good way." },
      { x: 20.8, z: 15.2, tier: 'keep', kind: 'dogtag', label: 'A luggage tag from a hotel that closed in 2004' },
    ],
    junk: 5,
    texts: {
      arrive: "Tight around the planters and the vents, so the trimmer earns its keep today. Don't lean on the parapet. It's decorative. I mean it.",
      mid: [{ pct: 50, t: "Half. Come look off the north side when you get there — you can see the water tower and the whole route from up here." }],
      reply: "Six floors up and it looks like a lawn instead of a roof with ambitions. Denise cried. Building says come back monthly.",
    },
  },
  {
    id: 'cutterfield', block: 5, tour: true, name: 'Cutter Field', client: 'Hazel Park Owls (Single-A)', who: 'MARISOL (GROUNDS)',
    blurb: "A real ballpark with real grounds crew standards and a real crown on the outfield so the rain runs off. Marisol wants the pattern in it — bands, alternating, straight as a ruler, because it goes on the local news Friday. No pressure. Actually, no pressure at all: nothing here can be ruined.",
    pop: 'it goes on the news',
    lot: { w: 38, h: 26 }, seed: 606, fence: 'chain', gate: { x: 19, w: 2.2 }, hood: 'edge',
    terrain: { features: [{ k: 'mound', x: 19, z: 13, r: 20, h: 0.75 }] },   // the outfield crown, for drainage
    tiers: [{ t: 'base', tier: 2 }],
    props: [
      { k: 'bleacher', x: 8, z: 2.4, o: { w: 9, rows: 6 } }, { k: 'bleacher', x: 30, z: 2.4, o: { w: 9, rows: 6 } },
      { k: 'flagpole', x: 19, z: 24.2 },
      { k: 'bench', x: 3.0, z: 6.0, rot: 1.571 }, { k: 'bench', x: 35.0, z: 6.0, rot: -1.571 },
      { k: 'hydrant', x: 36.4, z: 23.6 }, { k: 'wheelbarrow', x: 2.6, z: 23.2, rot: 0.5 },
    ],
    // the pattern IS the zone layout: six bands you mow one way then the other
    zones: [
      { x: 0, z: 0, w: 38, h: 4.4, name: 'Band 1 — toward the plate' },
      { x: 0, z: 4.4, w: 38, h: 4.4, name: 'Band 2 — back out' },
      { x: 0, z: 8.8, w: 38, h: 4.4, name: 'Band 3 — toward the plate' },
      { x: 0, z: 13.2, w: 38, h: 4.4, name: 'Band 4 — back out' },
      { x: 0, z: 17.6, w: 38, h: 4.4, name: 'Band 5 — toward the plate' },
      { x: 0, z: 22, w: 38, h: 4, name: 'Band 6 — the warning track' },
    ],
    disc: [
      { x: 19.6, z: 13.4, tier: 'story', kind: 'ball', label: 'A ball, scuffed, signature worn to a smear', text: "Dead centre of the outfield. That's a home run ball nobody went and got. Whoever hit it never knew it landed. I'm keeping it on the desk." },
      { x: 36.8, z: 2.8, tier: 'keep', kind: 'medal', label: "A 1991 league pennant pin, back still sharp" },
    ],
    junk: 9,
    texts: {
      arrive: "Bands. Alternate your direction each pass and the light does the rest — that's the whole secret and grounds crews guard it like a recipe. Crown's gentle. You'll feel it more than see it.",
      mid: [{ pct: 65, t: "Come and look from the gate. THAT is a ballfield. That's going on the news and I'm taking the credit." }],
      reply: "Six bands, alternating, straight as a ruler. It was on the news. They filmed the outfield for eleven seconds and I have watched it forty times.",
    },
  },
  {
    id: 'ninthgreen', block: 5, tour: true, name: 'The Ninth at Ridgeway', client: 'Ridgeway Golf Club (municipal)', who: 'ARCHIE',
    blurb: "Municipal, nine holes, dollar-fifty a round in 1970 and not much more now. The ninth is all humps and hollows because the man who built it liked a joke. The green is precious. The rest is grass with opinions.",
    pop: 'humps and hollows',
    lot: { w: 34, h: 22 }, seed: 607, fence: 'none', gate: { x: 2.5, w: 2.0 }, hood: 'rural',
    terrain: { features: [
      { k: 'mound', x: 9, z: 8, r: 6.0, h: 1.3 },
      { k: 'mound', x: 22, z: 14, r: 6.5, h: 1.1 },
      { k: 'bowl', x: 15.5, z: 6, r: 5.0, h: 0.9 },
      { k: 'mound', x: 29, z: 6, r: 5.0, h: 0.8 },
    ] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'circle', x: 28, z: 17, r: 4.2, tier: 1 }, { t: 'rect', x: 0, z: 0, w: 8, h: 22, tier: 4 }],
    props: [
      { k: 'holeflag', x: 28, z: 17, o: { c: 0xf2c14e } },
      { k: 'bench', x: 24.4, z: 20.2, rot: 3.14 },
      { k: 'shrub', x: 6.0, z: 12.0 }, { k: 'shrub', x: 5.2, z: 17.4 }, { k: 'pine', x: 2.6, z: 4.0 },
      { k: 'pine', x: 2.2, z: 19.2 }, { k: 'stump', x: 18.4, z: 19.6 },
      { k: 'wheelbarrow', x: 32.2, z: 20.4, rot: 2.2 },
    ],
    zones: [
      { x: 0, z: 0, w: 8, h: 22, name: 'The Rough (left)' },
      { x: 8, z: 0, w: 13, h: 11, name: 'The Fairway Humps' },
      { x: 21, z: 0, w: 13, h: 11, name: 'The Upper Fairway' },
      { x: 8, z: 11, w: 13, h: 11, name: 'The Hollow' },
      { x: 21, z: 11, w: 13, h: 11, name: 'The Ninth Green' },
    ],
    disc: [
      { x: 27.4, z: 16.2, tier: 'story', kind: 'coin', label: 'A ball marker: a 1962 silver dime', text: "That's Walter's marker. He used the same dime for thirty years and swore it made putts drop. He'd want it left on the green, but I'm not leaving a dime out here. It goes behind the bar." },
      { x: 1.6, z: 10.8, tier: 'keep', kind: 'ball', label: 'A ball from a brand that stopped existing in 1978' },
    ],
    junk: 8,
    texts: {
      arrive: "Green's the delicate bit, do it last and do it slow. The humps you just have to walk. Man who built this course thought flat was for cowards.",
      mid: [{ pct: 55, t: "You've done the hollow. That's where the balls go to die and where I go to find them." }],
      reply: "Humps, hollow, rough and the green. Walter's dime is behind the bar with a little card. Dollar-fifty a round for you, forever.",
    },
  },
  {
    id: 'fairground', block: 5, tour: true, name: 'The Fairground, Monday', client: 'Hazel Park Fair Board', who: 'DEL',
    blurb: "The fair left Sunday night and the grass under it hasn't seen sun in nine days. Booths still standing, ride pads still marked out, everything smells faintly of fried dough. Mow it before the flattened bits set that way.",
    pop: 'still smells of dough',
    lot: { w: 30, h: 22 }, seed: 608, light: 'dusk', fence: 'chain', gate: { x: 15, w: 2.2 }, hood: 'edge',
    terrain: { features: [
      { k: 'bowl', x: 10, z: 8, r: 4.5, h: 0.35 },
      { k: 'bowl', x: 21, z: 15, r: 5.0, h: 0.4 },
      { k: 'slope', ang: 1.571, h: 0.7 },
    ] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'circle', x: 10, z: 8, r: 4.2, tier: 1 }, { t: 'circle', x: 21, z: 15, r: 4.6, tier: 1 }],
    props: [
      { k: 'booth', x: 4.0, z: 4.0, rot: 0.3 }, { k: 'booth', x: 4.0, z: 9.0, rot: 0.1, o: { c: 0x3b7ea5 } },
      { k: 'booth', x: 26.0, z: 5.0, rot: -0.4, o: { c: 0x4f8f52 } }, { k: 'booth', x: 26.2, z: 18.4, rot: -0.2, o: { c: 0xd8a23f } },
      { k: 'tyrestack', x: 15.4, z: 3.2 }, { k: 'gnome', x: 28.2, z: 11.0, o: { s: 1.4 } },
      { k: 'bench', x: 15, z: 20.4, rot: 3.14 }, { k: 'grill', x: 8.4, z: 19.6, rot: 0.6 },
    ],
    zones: [
      { x: 0, z: 0, w: 15, h: 11, name: 'The Midway (west)' },
      { x: 15, z: 0, w: 15, h: 11, name: 'The Midway (east)' },
      { x: 0, z: 11, w: 15, h: 11, name: 'The Ride Pads' },
      { x: 15, z: 11, w: 15, h: 11, name: 'Behind the Booths' },
    ],
    disc: [
      { x: 20.6, z: 15.4, tier: 'story', kind: 'ring', label: 'A plastic prize ring, green where it sat', text: "Somebody won that Saturday and lost it Saturday. Every year, Del. Every single year. I keep a jar of them in the office. Add it to the jar." },
      { x: 2.2, z: 20.8, tier: 'keep', kind: 'cap', label: 'A fair steward cap, 1996, brim shaped by hand' },
    ],
    junk: 10,
    texts: {
      arrive: "Ride pads are the flattened circles — grass under those is yellow and sulking, but it comes back if you cut it now. Everything else is just tall.",
      mid: [{ pct: 60, t: "The pads are greening already. You can see where the carousel sat if you squint. Bit sad, isn't it. In a nice way." }],
      reply: "It's a field again instead of an afterparty. The jar of lost rings has a new resident. Fair's back in eleven months and so are you.",
    },
  },
  {
    id: 'orchard', block: 5, tour: true, name: 'The Vesper Orchard', client: 'Vesper Family Orchard', who: 'JUNE VESPER',
    blurb: "Eleven rows of apple trees on a south-facing slope, grass between every one. The tractor mower died in April and the rows are too narrow for it anyway now the trees have thickened. Around each trunk by hand, please. There are ninety-odd trunks.",
    pop: 'ninety-odd trunks',
    lot: { w: 32, h: 24 }, seed: 609, fence: 'rail', gate: { x: 2.6, w: 1.8 }, hood: 'rural',
    terrain: { features: [{ k: 'slope', ang: 0, h: 3.2 }, { k: 'mound', x: 20, z: 12, r: 9, h: 0.6 }] },
    tiers: [{ t: 'base', tier: 3 }],
    props: [
      ...[4.5, 9.5, 14.5, 19.5, 24.5, 29.5].flatMap(z => [5, 11, 17, 23, 29].map(x => ({ k: 'tree', x, z: z * 0.78 + 2, o: { s: 0.85 } }))),
      { k: 'wheelbarrow', x: 2.8, z: 22.2, rot: 1.1 }, { k: 'shed', x: 29.0, z: 22.0, rot: -0.3 },
      { k: 'bench', x: 16, z: 22.6, rot: 3.14 },
    ],
    zones: [
      { x: 0, z: 0, w: 32, h: 8, name: 'Rows One to Three' },
      { x: 0, z: 8, w: 32, h: 8, name: 'Rows Four to Seven' },
      { x: 0, z: 16, w: 32, h: 8, name: 'Rows Eight to Eleven' },
    ],
    disc: [
      { x: 17.4, z: 11.2, tier: 'story', kind: 'trowel', label: "A grafting knife, initials W.V. on the handle", text: "That's my grandfather's. He grafted every tree in rows four through seven with that knife and I have been looking for it since the funeral. Oh, I'm going to sit down a minute." },
      { x: 30.8, z: 3.4, tier: 'keep', kind: 'coin', label: 'An orchard token, good for one bushel, 1954' },
    ],
    junk: 7,
    texts: {
      arrive: "Down the rows with the mower, around the trunks with the trimmer. It's slow. It's meant to be slow. The whole orchard's slow, that's rather the point of it.",
      mid: [{ pct: 50, t: "You're through row seven. Those are grandfather's grafts, those middle ones. Best apples on the place and I'm not being sentimental, they measure better." }],
      reply: "Eleven rows and every trunk. The knife is on the kitchen windowsill where I can see it. Come back at harvest and take what you can carry.",
    },
  },
  {
    id: 'threeam', block: 5, tour: true, name: 'The 3AM Contract', client: '—', who: '—',
    blurb: "The number left one message. It gave a field, a time, and a shape. It paid in advance, in cash, in an envelope taped under the gate latch. The shape is drawn on the back of the envelope and it is not a shape any lawn needs. You are going to mow it anyway, because you want to know.",
    pop: '—', noRadio: true,
    lot: { w: 30, h: 24 }, seed: 610, light: 'night', fence: 'rail', gate: { x: 15, w: 1.8 }, hood: 'rural',
    terrain: { features: [
      { k: 'mound', x: 15, z: 12, r: 7.0, h: 1.1 },
      { k: 'mound', x: 6, z: 6, r: 3.6, h: 0.7 },
      { k: 'mound', x: 24, z: 6, r: 3.6, h: 0.7 },
      { k: 'mound', x: 6, z: 18, r: 3.6, h: 0.7 },
      { k: 'mound', x: 24, z: 18, r: 3.6, h: 0.7 },
    ] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'circle', x: 15, z: 12, r: 6.0, tier: 4 }],
    props: [
      { k: 'stump', x: 15, z: 12 },
      { k: 'gnome', x: 15, z: 3.2, o: { s: 1.2 } },
      { k: 'mailbox', x: 15.6, z: 22.6 },
    ],
    zones: [
      { x: 0, z: 0, w: 30, h: 8, name: 'The Outer Ring (north)' },
      { x: 0, z: 8, w: 9, h: 8, name: 'The West Arc' },
      { x: 21, z: 8, w: 9, h: 8, name: 'The East Arc' },
      { x: 9, z: 8, w: 12, h: 8, name: 'The Centre' },
      { x: 0, z: 16, w: 30, h: 8, name: 'The Outer Ring (south)' },
    ],
    disc: [
      { x: 15.2, z: 11.4, tier: 'story', kind: 'key', label: 'A key on a paper tag. The tag says THANK YOU.', text: "(You put it in your pocket. You do not find a door for it. You keep it anyway, and some mornings you take it out and look at it.)" },
      { x: 28.4, z: 21.8, tier: 'keep', kind: 'arrowhead', label: 'A small stone, warm, which is not how stones are' },
    ],
    junk: 4,
    texts: {
      arrive: "(The envelope had no name on it. The shape is five circles and a ring. You have three hours of dark and a full tank.)",
      mid: [{ pct: 70, t: "(Something moves at the treeline. When you look up it is a deer, and it is watching you work, and it does not run.)" }],
      reply: "(There is a second envelope under the latch when you finish. It is thicker than the first. There is no message. The field, from the road, looks like nothing at all — unless you climb the bank, and then it looks like exactly what was drawn.)",
    },
  },
];
