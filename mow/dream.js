// FRESH CUT — dream.js
// THE PAGES NOBODY WROTE.
//
// The Daily Lawn has always said it: "every morning the notebook grows one page nobody
// wrote." For a long time those pages were ordinary. They are not ordinary any more.
//
// This is the book where THE GRASS STOPS BEING GRASS — the one thing a mowing game can do
// that nothing else can, because cutting here is a mask and a shader, so the whole loop
// (the stripes, the bag, the discoveries, the pattern score, the postcard) transfers intact
// to cloud, to embers, to the night sky. Every map sets `def.grass`, and the deck cuts it
// exactly the way it cuts a lawn on Birch Street.
//
// ⚠️ THE VOICE DOES NOT CHANGE. Nobody in this book knows they are in a strange place, the
// same way nobody in The Odd Sizes knows they are funny. The client is matter-of-fact, the
// job is a job, the invoice is a real invoice. That deadpan is the whole instrument — the
// moment a character says "how WEIRD!" the page dies. Pop's route is what makes these land:
// you spent nineteen honest pages in Hazel Park first, so when the grass is cloud you
// simply do what you always do, which is mow it properly and go home.
export const DREAM = [
  {
    id: 'cloudfield', block: 7, dream: true, name: 'The Cloud Field', client: 'The Weather, apparently', who: 'A VOICE ON THE PHONE', gearLock: 'hover',
    blurb: "The call came at four in the morning and the address was a bearing and an altitude. There is a field up here. It is on top of the cloud and it needs doing before the sun gets high enough for people on the ground to see it. Use the hover. Obviously use the hover.",
    pop: 'before the sun gets high',
    lot: { w: 30, h: 22 }, seed: 801, fence: 'none', gate: { x: 14, w: 2.4 }, hood: 'elsewhere',
    apron: 0x8f96b8,
    grass: { stripeD: 0xd8d2e0, stripeL: 0xfbf7ff, uncutA: 0x9aa0c0, uncutB: 0x7d84ab, highC: 0xb4bad4, rootC: 0x8f96b8, tipA: 0xe4e0f0, tipB: 0xc9cbe4, cutTip: 0xfdfbff },
    palette: { arc: true, sky: 0xffd9c0, fog: 0xffcdb4, hemi: 0xffe6d8, sun: 0xfff0dc, hemiI: 1.15, sunI: 1.3, fogNear: 26, fogFar: 130 },
    hero: [{ k: 'moon', x: -34, z: 58, s: 0.85, lift: 0.34 }, { k: 'whale', x: 46, z: 40, s: 1.0, y: 24, c: 0x7f93b4, belly: 0xc6d2e2, lift: 0.42 }],
    terrain: { features: [{ k: 'mound', x: 10, z: 8, r: 9, h: 1.4 }, { k: 'mound', x: 22, z: 15, r: 8, h: 1.1 }, { k: 'bowl', x: 16, z: 18, r: 6, h: 0.8 }] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'circle', x: 10, z: 8, r: 6, tier: 4 }],
    props: [
      { k: 'bench', x: 15, z: 20.4, rot: 3.14 }, { k: 'birdbath', x: 22, z: 6 },
      { k: 'flagpole', x: 3.4, z: 4 }, { k: 'planter', x: 26.6, z: 19 },
    ],
    zones: [
      { x: 0, z: 0, w: 15, h: 11, name: 'The Near Bank' }, { x: 15, z: 0, w: 15, h: 11, name: 'The Sunward Side' },
      { x: 0, z: 11, w: 15, h: 11, name: 'Under the Whale' }, { x: 15, z: 11, w: 15, h: 11, name: 'The Long Drift' },
    ],
    disc: [{ x: 15.4, z: 11.4, tier: 'story', kind: 'key', label: 'A door key, wet through', text: "That will be from the house that used to be under this bit. Post it back down when you get a chance — there's no hurry, it's been up here eleven years." },
      { x: 27.4, z: 3.2, tier: 'keep', kind: 'fossil', label: 'A hailstone that never fell' }],
    junk: 6,
    texts: {
      arrive: "Mind the edges. I know it looks solid and I'm telling you it is solid, but mind the edges anyway, because I'd rather say it than not say it.",
      mid: [{ pct: 55, t: "The whale comes past about now. She's fine. She's not interested in you and you shouldn't be interested in her." }],
      reply: "Done before the light. Nobody on the ground will ever know it was up here, which is the job. Same bearing next month.",
    },
  },
  {
    id: 'starmeadow', block: 7, dream: true, name: 'The Star Meadow', client: 'The Night Shift (different one)', who: 'THE CARETAKER', light: 'night', noRadio: true,
    blurb: "The old caretaker from the memorial grounds left an address in an envelope and a note that said 'you did right by mine, so here's the other job.' The field is the night sky, seen from the wrong side. It has gone to seed. Cutting it does not put the stars out — he was very firm about that — it lets them through.",
    pop: 'it lets them through',
    lot: { w: 34, h: 24 }, seed: 802, fence: 'rail', gate: { x: 16, w: 2.2 }, hood: 'elsewhere',
    apron: 0x0d1122,
    grass: { stripeD: 0x2a3358, stripeL: 0x4f5f96, uncutA: 0x141a30, uncutB: 0x0d1122, highC: 0x1e2745, rootC: 0x11162a, tipA: 0x8f9ed0, tipB: 0x5a6a9e, cutTip: 0xc4d0f2, stripeAmt: 1.15 },
    palette: { hemi: 0x2a3560, ground: 0x0a0e1c, sun: 0x9db3d8, hemiI: 0.75, sunI: 0.55, fogNear: 40, fogFar: 175 },
    hero: [{ k: 'moon', x: 40, z: 62, s: 1.15, lift: 0.36 }, { k: 'arch', x: -32, z: 46, s: 0.9, lift: 0.26 }],
    terrain: { features: [{ k: 'ridge', x1: 0, z1: 12, x2: 34, z2: 12, w: 3.4, h: 0.9 }, { k: 'mound', x: 24, z: 18, r: 8, h: 1.2 }] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 12, w: 34, h: 12, tier: 4 }],
    props: [
      { k: 'headstone', x: 5, z: 5 }, { k: 'headstone', x: 9.4, z: 5.4 }, { k: 'headstone', x: 13.6, z: 5 },
      { k: 'bench', x: 17, z: 22.4, rot: 3.14 }, { k: 'statue', x: 28, z: 8 }, { k: 'flagpole', x: 3, z: 20 },
    ],
    zones: [
      { x: 0, z: 0, w: 17, h: 12, name: 'The Shallow Field' }, { x: 17, z: 0, w: 17, h: 12, name: 'The Bright Row' },
      { x: 0, z: 12, w: 17, h: 12, name: 'Deep Sky' }, { x: 17, z: 12, w: 17, h: 12, name: 'The Long Dark' },
    ],
    disc: [{ x: 17.4, z: 12.4, tier: 'story', kind: 'photo', label: 'A photograph, taken from underneath', text: "That's the view the rest of them get. He kept one in his coat for forty years and never once said where he'd been to take it." },
      { x: 32, z: 22.4, tier: 'keep', kind: 'medal', label: 'A brass tag: NIGHT SHIFT, NO. 2' }],
    junk: 5,
    texts: {
      arrive: "Slow, and don't hurry the corners. The ones underneath are looking up at this and they've been looking a long while.",
      mid: [{ pct: 60, t: "There. That's a constellation you've just let through. Somebody down there is naming it after a dog." }],
      reply: "Clean sky. He'd have said it was passable, which from him was the whole medal. The envelope had a second address in it. It'll keep till next month.",
    },
  },
  {
    id: 'emberfield', block: 7, dream: true, name: 'The Ember Field', client: 'Vesper Family Orchard (the other field)', who: 'JUNE VESPER', gearLock: 'titan',
    blurb: "The fire went through the top field in August and it never quite went out. It doesn't spread and it doesn't burn you — June has tested both, at length, with a stick — it just sits there glowing and growing. The insurance man had no box for it. It still needs cutting before the frost.",
    pop: 'the insurance man had no box for it',
    lot: { w: 32, h: 24 }, seed: 803, light: 'dusk', fence: 'chain', gate: { x: 15, w: 2.4 }, hood: 'elsewhere',
    apron: 0x3a1105,
    grass: { stripeD: 0x8f3312, stripeL: 0xe86a1c, uncutA: 0x521a08, uncutB: 0x3a1105, highC: 0x6f2610, rootC: 0x2e0d04, tipA: 0xff9a3c, tipB: 0xd85a16, cutTip: 0xffb45a },
    palette: { sky: 0x5e2f1c, fog: 0x7a3a16, hemi: 0xff9a5c, ground: 0x3a1105, sun: 0xffb26a, hemiI: 1.0, sunI: 1.3, fogNear: 26, fogFar: 130 },
    hero: [{ k: 'mill', x: -30, z: 50, s: 0.85, c: 0x6b3524, stack: 0x7d3a26, lift: 0.30 }, { k: 'moon', x: 44, z: 44, s: 0.7, c: 0xe8b48c, sea: 0xd89a72, halo: 0xf0c49c, lift: 0.32 }],
    terrain: { features: [{ k: 'bowl', x: 16, z: 10, r: 11, h: 1.6 }, { k: 'mound', x: 26, z: 19, r: 7, h: 1.0 }] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'circle', x: 16, z: 10, r: 7, tier: 4 }],
    props: [
      { k: 'stump', x: 6, z: 6, s: 1.4 }, { k: 'stump', x: 27, z: 7, s: 1.2 }, { k: 'stump', x: 10, z: 20, s: 1.1 },
      { k: 'tyrestack', x: 3.4, z: 12 }, { k: 'wheelbarrow', x: 29, z: 21, rot: 2.2 }, { k: 'bench', x: 16, z: 22.6, rot: 3.14 },
    ],
    zones: [
      { x: 0, z: 0, w: 16, h: 12, name: 'The Burnt Rows' }, { x: 16, z: 0, w: 16, h: 12, name: 'The Hollow' },
      { x: 0, z: 12, w: 16, h: 12, name: 'The Windward Edge' }, { x: 16, z: 12, w: 16, h: 12, name: 'Where It Started' },
    ],
    disc: [{ x: 16.6, z: 12.6, tier: 'story', kind: 'ring', label: "A wedding band, not even warm", text: "That's my mother's. It went in the fire with the house in '71 and it has been in this field ever since, not burning, like everything else up here. I'd stopped looking. Thank you." },
      { x: 30.4, z: 3.4, tier: 'keep', kind: 'arrowhead', label: 'A cinder that will not go out' }],
    junk: 7,
    texts: {
      arrive: "Titan, and take it slow. It won't catch. I've had a stick in it for four years and the stick is fine. The stick is over there if you want to see the stick.",
      mid: [{ pct: 60, t: "You'll notice it's cooler where you've cut. That's the only bit of this anyone's ever been able to explain." }],
      reply: "Cut back to the roots and the glow's down to a hearth. Frost'll do the rest. Come at Christmas — it's the warmest field in the county and we have it to ourselves.",
    },
  },
  {
    id: 'sleepinghill', block: 7, dream: true, name: 'The Sleeping Hill', client: 'The Parish of Underhill', who: 'THE VERGER',
    blurb: "The hill behind the church is a hill in every way that matters: it has a footpath, a bench, and a view. It also has a pulse of about four beats a minute, which the parish has agreed not to make a fuss about. Mow with the grain. It is not dangerous. It is asleep, and the parish would very much like it to stay that way.",
    pop: 'mow WITH the grain',
    lot: { w: 30, h: 22 }, seed: 804, fence: 'rail', gate: { x: 14, w: 2.0 }, hood: 'elsewhere',
    apron: 0x2a4118,
    grass: { stripeD: 0x4a6b2c, stripeL: 0x86b04a, uncutA: 0x2a4118, uncutB: 0x1d2f11, highC: 0x35521f, rootC: 0x243a14, tipA: 0x6f9a3a, tipB: 0x50762c, cutTip: 0x9cc45c },
    palette: { arc: true, sky: 0xd8e4c8, fog: 0xc2d4b0, hemi: 0xe0eed0, sun: 0xfff4d0, hemiI: 0.95, sunI: 1.5, fogNear: 30, fogFar: 150 },
    hero: [{ k: 'church', x: -26, z: 48, s: 0.95 }, { k: 'arch', x: 40, z: 40, s: 0.75, through: 0x3a5a3a, lift: 0.26 }],
    // the ribs. Mow across them and you are mowing across something's chest.
    terrain: { features: [
      { k: 'ridge', x1: 2, z1: 6, x2: 28, z2: 7, w: 2.6, h: 1.1 }, { k: 'ridge', x1: 2, z1: 11, x2: 28, z2: 12, w: 2.6, h: 1.25 },
      { k: 'ridge', x1: 2, z1: 16, x2: 28, z2: 17, w: 2.6, h: 1.0 }, { k: 'mound', x: 15, z: 12, r: 13, h: 1.2 },
    ] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 14, w: 30, h: 8, tier: 4 }],
    pattern: true,
    props: [
      { k: 'bench', x: 15, z: 3.2, rot: 0 }, { k: 'headstone', x: 4, z: 19 }, { k: 'headstone', x: 7.6, z: 19.6 },
      { k: 'tree', x: 26, z: 17, o: { s: 1.2 } }, { k: 'shrub', x: 3, z: 8 }, { k: 'statue', x: 22, z: 5, s: 1.2 },
    ],
    zones: [
      { x: 0, z: 0, w: 30, h: 6, name: 'The Footpath' }, { x: 0, z: 6, w: 15, h: 8, name: 'The Near Ribs' },
      { x: 15, z: 6, w: 15, h: 8, name: 'The Far Ribs' }, { x: 0, z: 14, w: 30, h: 8, name: 'The Shoulder' },
    ],
    disc: [{ x: 15.4, z: 12.4, tier: 'story', kind: 'trowel', label: "A verger's trowel, worn to a nub", text: "Ellis had this hill for fifty-one years and he mowed it with the grain every fortnight and it never once woke. He never wrote down why he thought that mattered. We do it his way regardless." },
      { x: 28.4, z: 20.6, tier: 'keep', kind: 'coin', label: 'A coin nobody in the parish recognises' }],
    junk: 6,
    texts: {
      arrive: "With the grain — that's along the ribs, not across them. It has never woken. We would like the record to stay perfect and we would like you to be the one who keeps it.",
      mid: [{ pct: 60, t: "You felt that. Everyone feels that at about the halfway mark. It's four a minute and it means everything's normal." }],
      reply: "Fifty-two years of a perfect record and you've kept it. The parish council would like to buy you a drink and never discuss this again.",
    },
  },
  {
    id: 'lastpage', block: 7, dream: true, name: 'The Page That Wrote Itself', client: '—', who: null, gearLock: 'push', noRadio: true, finaleDream: true,
    blurb: "The notebook grew a page this morning and the handwriting is Pop's. Not like Pop's. His. The address is a field you have never heard of and the margin note says the same thing he always said about the first job of the day, which is that you'll know it when you're standing in it.",
    pop: "you'll know it when you're standing in it",
    lot: { w: 26, h: 20 }, seed: 1957, fence: 'picket', gate: { x: 12, w: 1.6 }, hood: 'elsewhere',
    apron: 0x18203a,
    // it starts as the night sky and ends as an ordinary lawn: the cut IS the dawn
    grass: { stripeD: 0x3f6a34, stripeL: 0x8fc457, uncutA: 0x18203a, uncutB: 0x101628, highC: 0x2c4a2c, rootC: 0x1a2a18, tipA: 0x6f9ac0, tipB: 0x46608f, cutTip: 0xa8d868, stripeAmt: 1.1 },
    palette: { arc: true, sky: 0x2e3a62, fog: 0x46527e, hemi: 0x8fa0d0, sun: 0xffd9a8, hemiI: 0.85, sunI: 1.1, fogNear: 30, fogFar: 160 },
    hero: [{ k: 'moon', x: -30, z: 52, s: 0.8, lift: 0.32 }, { k: 'church', x: 34, z: 46, s: 0.8 }, { k: 'tower', x: 6, z: 60, s: 0.9 }],
    terrain: { features: [{ k: 'mound', x: 13, z: 11, r: 11, h: 0.8 }] },
    tiers: [{ t: 'base', tier: 3 }, { t: 'rect', x: 0, z: 0, w: 26, h: 5, tier: 2 }],
    pattern: true,
    props: [
      { k: 'tree', x: 21.6, z: 14.6, o: { s: 1.4, seed: 57, tire: true } },
      { k: 'flowerbed', x: 3.4, z: 13.4, o: { r: 1.3, cols: [0xe86a92, 0xfdfdf8], seed: 58 } },
      { k: 'bench', x: 13, z: 17.6, rot: 3.14 }, { k: 'mailbox', x: 5.2, z: 1.2, o: { c: 0xc0392b } },
      { k: 'birdbath', x: 10, z: 12 }, { k: 'shed', x: 23.4, z: 3.4, rot: -0.6, o: { c: 0x8a7358, w: 2.2, d: 1.8 } },
    ],
    zones: [
      { x: 0, z: 0, w: 26, h: 5, name: 'The Front Walk' }, { x: 0, z: 5, w: 13, h: 8, name: 'The Peony Side' },
      { x: 13, z: 5, w: 13, h: 8, name: 'The Shed Run' }, { x: 0, z: 13, w: 26, h: 7, name: 'Under the Tire Swing' },
    ],
    disc: [
      { x: 13.4, z: 11.4, tier: 'story', kind: 'cap', label: 'A cap, sun-bleached red, still warm', text: "(It is the same cap. You are wearing the same cap. You check, and you are, and both of them fit, and you decide on the spot that this is a thing you are simply going to allow.)", self: true },
      { x: 21.2, z: 15.4, tier: 'story', kind: 'plank', label: 'A board off the tire swing, newly sanded', text: "(Somebody has been keeping it up. The rope is new. The knot is the one he taught you, tied the way you tie it, which is slightly wrong in the way that is yours.)", self: true },
      { x: 4.4, z: 3.2, tier: 'keep', kind: 'photo', label: 'A photograph of a field you are standing in' },
    ],
    junk: 0,
    texts: {
      arrive: "(No client. No gate code. The mower is already out of the truck and warm, which you did not do, and the light is doing the thing it does about twenty minutes before it is properly morning.)",
      mid: [{ pct: 55, t: "(It gets greener where you cut. Not brighter — greener. The night is coming off it like a top coat.)" }],
      reply: "(By the last pass it is an ordinary lawn on an ordinary morning and the page is full. There is no reply and no invoice, and when you look again the handwriting in the margin is yours.\n\n— FRESH CUT —)",
    },
  },
];
