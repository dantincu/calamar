/**
 * The map of the Magheru engine.
 *
 * World frame: metres, +Y up, the boulevard's axis is x = 0, north is -Z, east is +X.
 * z = 0 is the south end of Magheru (where it becomes Bd. Nicolae Bălcescu); Piața Romană is
 * at its north end, about 800 m away. Bălcescu continues south to Piața Universității and
 * Bd. Lascăr Catargiu continues north of Piața Romană; both are rendered with less detail.
 *
 * The landmarks are the boulevard's real buildings with their real dates and character
 * (Lido 1930, ARO/Patria 1931 by Horia Creangă, Scala 1937, Ambasador 1937–39, Ciclop 1923
 * by Constantin Iotzu, the 1959–61 ITB, Eva and ONT blocks...). Their order along the street,
 * the side-street positions and the in-between blocks are a best approximation, not a survey.
 */
import { rng, type Rng } from '../core/util';

export const ROAD_HALF = 12; // 4 lanes of 3 m each way
export const FRONT_X = 19.5; // building line: 7.5 m sidewalks
export const LANES = [1.5, 4.5, 7.5, 10.5];

export const MAGHERU_SOUTH = 0;
export const MAGHERU_NORTH = -740;
export const ROMANA_Z = -812; // centre of Piața Romană / Bd. Dacia
export const ROMANA_HALF = 70;
export const UNIVERSITATE_Z = 720; // Bd. Regina Elisabeta / Carol I crossing
export const AXIS_SOUTH = 900;
export const AXIS_NORTH = -1500;

export interface CrossStreet {
  z: number;
  width: number;
  west: string;
  east: string;
  major?: boolean;
}

/** Streets crossing the main axis, south to north. */
export const CROSS_STREETS: CrossStreet[] = [
  { z: UNIVERSITATE_Z, width: 30, west: 'Bd. Regina Elisabeta', east: 'Bd. Carol I', major: true },
  { z: 560, width: 10, west: 'Str. Academiei', east: 'Str. Batiștei (sud)' },
  { z: 380, width: 10, west: 'Str. Edgar Quinet', east: 'Str. Dianei' },
  { z: 190, width: 12, west: 'Bd. Regina Elisabeta (nord)', east: 'Str. Rosetti' },
  { z: 6, width: 14, west: 'Str. C. A. Rosetti', east: 'Str. Tudor Arghezi' },
  { z: -200, width: 10, west: 'Str. Biserica Amzei', east: 'Str. Pictor Arthur Verona' },
  { z: -420, width: 10, west: 'Str. Tache Ionescu', east: 'Str. Pitar Moș' },
  { z: -600, width: 10, west: 'Str. Mendeleev', east: 'Str. Jules Michelet' },
  { z: ROMANA_Z, width: 26, west: 'Bd. Dacia', east: 'Bd. Dacia', major: true },
  { z: -1060, width: 10, west: 'Str. Vasile Conta', east: 'Str. Grigore Alexandrescu' },
  { z: -1280, width: 12, west: 'Str. Polonă', east: 'Str. Gheorghe Manu' },
];

export type FacadeStyle = 'ribbon' | 'punched' | 'vertical' | 'grid' | 'curtain' | 'classic';

export interface Tier {
  floors: number;
  /** Set back from the front of the tier below, metres. */
  inset: number;
  /** Set back from each end (along the street), metres. */
  sideInset?: number;
  style?: FacadeStyle;
}

export interface SignSpec {
  text: string;
  kind: 'roof' | 'blade' | 'marquee' | 'fascia';
  color: string;
  bg?: string;
  /** 'south' / 'north' end of the building, for blades. */
  at?: 'south' | 'north';
}

export interface BuildingSpec {
  id: string;
  name?: string;
  subtitle?: string;
  side: 'W' | 'E';
  zSouth: number;
  zNorth: number;
  depth: number;
  floors: number;
  floorH?: number;
  groundH?: number;
  style: FacadeStyle;
  wall: string;
  trim?: string;
  accent?: string;
  /** Probability that a bay of an upper floor has a 3D balcony. */
  balconies?: number;
  tiers?: Tier[];
  signs?: SignSpec[];
  shops?: boolean;
  /** A cinema/theatre entrance instead of shops in the middle of the ground floor. */
  entrance?: string;
  /** Texture resolution, pixels per metre. */
  ppm?: number;
  /** Rounded corner at the given end (drawn as a cylinder). */
  roundCorner?: 'south' | 'north';
  /** Distance from the building line (positive = further from the street). */
  setback?: number;
}

export const SHOP_NAMES = [
  'FARMACIE', 'CAFENEA', 'LIBRĂRIE', 'FLORĂRIE', 'CASA DE SCHIMB', 'BANCA', 'PATISERIE', 'COVRIGĂRIE', 'BIJUTERII', 'OPTICĂ',
  'PIZZERIE', 'MODĂ', 'ÎNCĂLȚĂMINTE', 'BISTRO', 'AGENȚIE DE TURISM', 'TUTUN • ZIARE', 'TELEFOANE', 'SHAORMA', 'GELATERIE',
  'ANTICARIAT', 'CEASURI', 'PARFUMERIE', 'CROITORIE', 'CEAINĂRIE', 'BRUTĂRIE', 'COFETĂRIE', 'MINIMARKET', 'LOTO', 'FOTO',
];

const PLASTER = ['#d8cfbd', '#cbbca2', '#bdb5a6', '#e3dccd', '#a99b86', '#959189', '#cfb07e', '#c2a68a', '#d6c7a9', '#b9ad9a', '#c8c0b0'];
const MODERN = ['#e9e4d8', '#ddd8cc', '#d1cbbd'];
const PANELS = ['#4f6d8a', '#6a8a7a', '#8a6a4f', '#5b5f74', '#7a4f4f', '#9c8a55'];

let autoId = 0;
/** An ordinary block of flats with shops, the fabric between the landmarks. */
export function genericBuilding(side: 'W' | 'E', zSouth: number, frontage: number, r: Rng, era: 'interwar' | 'socialist' | 'mixed' = 'mixed', ppm = 12): BuildingSpec {
  const pickEra = era === 'mixed' ? r.pick(['interwar', 'interwar', 'socialist', 'old'] as const) : era;
  const base = { id: `g${autoId++}`, side, zSouth, zNorth: zSouth - frontage, ppm, depth: r.range(16, 24) } as const;
  if (pickEra === 'socialist') {
    return {
      ...base,
      floors: r.int(8, 11),
      style: r.pick(['grid', 'grid', 'curtain'] as const),
      wall: r.pick(PLASTER.slice(2)),
      accent: r.pick(PANELS),
      balconies: r.chance(0.5) ? 0.35 : 0,
    };
  }
  if (pickEra === 'old') {
    return {
      ...base,
      floors: r.int(4, 6),
      floorH: 3.8,
      style: 'classic',
      wall: r.pick(PLASTER),
      trim: '#efe9dc',
      balconies: 0.12,
    };
  }
  const floors = r.int(7, 10);
  const tiers: Tier[] = r.chance(0.55) ? [{ floors: r.int(1, 2), inset: r.range(2, 3.5) }] : [];
  return {
    ...base,
    floors,
    style: r.pick(['punched', 'punched', 'ribbon', 'vertical'] as const),
    wall: r.pick([...PLASTER, ...MODERN]),
    trim: '#eee8dc',
    balconies: r.pick([0, 0.25, 0.45]),
    tiers,
  };
}

interface RowItem {
  frontage: number;
  spec?: Omit<BuildingSpec, 'side' | 'zSouth' | 'zNorth'>;
}

function row(side: 'W' | 'E', zSouth: number, items: RowItem[], r: Rng): BuildingSpec[] {
  const out: BuildingSpec[] = [];
  let z = zSouth;
  for (const it of items) {
    out.push(it.spec ? { ...it.spec, side, zSouth: z, zNorth: z - it.frontage } : genericBuilding(side, z, it.frontage, r, 'interwar', 14));
    z -= it.frontage;
  }
  return out;
}

/** Magheru proper: the landmarks and the blocks around them. */
export function magheruBuildings(): BuildingSpec[] {
  const r = rng(1931);
  const west: BuildingSpec[] = [
    // Str. C. A. Rosetti … Str. Biserica Amzei
    ...row('W', -1, [
      { frontage: 34, spec: { id: 'gaz', name: 'Palatul Societății de Gaz și Electricitate', subtitle: '1935', depth: 26, floors: 7, floorH: 3.6, groundH: 5, style: 'classic', wall: '#bfb39c', trim: '#e7dfcc', ppm: 14, roundCorner: 'south' } },
      { frontage: 30, spec: { id: 'eva', name: 'Blocul Eva', subtitle: '1961 · Magazinul Eva', depth: 20, floors: 9, style: 'grid', wall: '#cfc8b8', accent: '#5f7f95', ppm: 14, signs: [{ text: 'EVA', kind: 'roof', color: '#ff4d6d' }] } },
      { frontage: 46, spec: { id: 'lido', name: 'Hotel Lido', subtitle: '1930 · fostul Hotel Angelescu', depth: 24, floors: 8, groundH: 5, style: 'ribbon', wall: '#ece6d8', trim: '#ffffff', ppm: 14, tiers: [{ floors: 1, inset: 3 }], signs: [{ text: 'HOTEL LIDO', kind: 'roof', color: '#4fc3f7' }], entrance: 'HOTEL LIDO' } },
      { frontage: 40, spec: { id: 'ont', name: 'Blocul ONT', subtitle: '1961 · Oficiul Național de Turism', depth: 20, floors: 11, style: 'grid', wall: '#d6d0c2', accent: '#3f6e8c', ppm: 14, balconies: 0, signs: [{ text: 'ONT CARPAȚI', kind: 'roof', color: '#ffd166' }] } },
      { frontage: 44, spec: { id: 'casata', name: 'Blocul Casata', subtitle: '1938 · reconstruit după 1977', depth: 22, floors: 10, style: 'curtain', wall: '#9aa5ad', accent: '#2e4a5f', ppm: 14 } },
    ], r),
    // Str. Biserica Amzei … Str. Tache Ionescu
    ...row('W', -205, [{ frontage: 40 }, { frontage: 45 }, { frontage: 35 }, { frontage: 50 }, { frontage: 40 }], r),
    // Str. Tache Ionescu … Str. Mendeleev
    ...row('W', -425, [
      { frontage: 58, spec: { id: 'ciclop', name: 'Garajul Ciclop', subtitle: '1923–1926 · Constantin Iotzu', depth: 34, floors: 6, floorH: 3.4, groundH: 6, style: 'classic', wall: '#c9bea8', trim: '#ece4d2', ppm: 14, shops: false, entrance: 'CICLOP', signs: [{ text: 'CICLOP', kind: 'fascia', color: '#1f2a44', bg: '#efe6cf' }] } },
      { frontage: 57 },
      { frontage: 55 },
    ], r),
    // Str. Mendeleev … Piața Romană
    ...row('W', -605, [{ frontage: 45 }, { frontage: 50 }, { frontage: 40 }], r),
  ];

  const east: BuildingSpec[] = [
    ...row('E', -1, [
      { frontage: 58, spec: { id: 'scala', name: 'Blocul Scala', subtitle: 'Cinema Scala · 1937, reconstruit după 1977', depth: 24, floors: 11, groundH: 5.5, style: 'grid', wall: '#d9d4c8', accent: '#6c7a89', ppm: 14, entrance: 'CINEMA SCALA', signs: [{ text: 'SCALA', kind: 'marquee', color: '#ff3b3b' }, { text: 'SCALA', kind: 'roof', color: '#ff3b3b' }] } },
      { frontage: 44, spec: { id: 'ambasador', name: 'Hotel Ambasador', subtitle: '1937–1939', depth: 24, floors: 11, groundH: 5, style: 'vertical', wall: '#e2d9c6', trim: '#f4efe4', accent: '#7a6a55', ppm: 14, tiers: [{ floors: 2, inset: 3, sideInset: 4 }, { floors: 2, inset: 3, sideInset: 4 }], signs: [{ text: 'AMBASADOR', kind: 'roof', color: '#ffc857' }], entrance: 'HOTEL AMBASADOR' } },
      { frontage: 62, spec: { id: 'patria', name: 'Blocul ARO — Cinema Patria', subtitle: '1929–1931 · Horia Creangă', depth: 26, floors: 10, groundH: 5.5, style: 'ribbon', wall: '#eeeae0', trim: '#ffffff', ppm: 14, entrance: 'CINEMA PATRIA', signs: [{ text: 'PATRIA', kind: 'blade', color: '#ff2e63', at: 'south' }, { text: 'PATRIA', kind: 'marquee', color: '#ffffff', bg: '#c1121f' }] } },
      { frontage: 31 },
    ], r),
    ...row('E', -205, [
      { frontage: 50, spec: { id: 'nottara', name: 'Teatrul Nottara', subtitle: 'fondat 1947', depth: 22, floors: 9, style: 'punched', wall: '#d3c6ae', trim: '#efe7d6', ppm: 14, balconies: 0.3, entrance: 'TEATRUL NOTTARA', signs: [{ text: 'TEATRUL NOTTARA', kind: 'fascia', color: '#ffffff', bg: '#7b1e3a' }] } },
      { frontage: 55, spec: { id: 'itb', name: 'Blocul ITB', subtitle: '1959', depth: 22, floors: 8, floorH: 3.4, style: 'classic', wall: '#c7b89c', trim: '#e8dfca', ppm: 14, balconies: 0.2 } },
      { frontage: 50 },
      { frontage: 55 },
    ], r),
    ...row('E', -425, [{ frontage: 60 }, { frontage: 55 }, { frontage: 55 }], r),
    ...row('E', -605, [{ frontage: 45 }, { frontage: 45 }, { frontage: 45 }], r),
  ];
  return [...west, ...east];
}

/** Bd. Nicolae Bălcescu (south) and Bd. Lascăr Catargiu (north), filled with generic blocks. */
export function axisBuildings(): BuildingSpec[] {
  const r = rng(1859);
  const out: BuildingSpec[] = [];
  const fill = (side: 'W' | 'E', zFrom: number, zTo: number, skip?: (zS: number, zN: number) => boolean) => {
    let z = zFrom;
    while (z - 25 > zTo) {
      const len = Math.min(r.range(30, 55), z - zTo);
      if (!skip?.(z, z - len)) out.push(genericBuilding(side, z, len, r, 'mixed', 9));
      z -= len;
    }
  };
  // segments between the cross streets south of Magheru
  const south = CROSS_STREETS.filter((c) => c.z > 0).map((c) => c.z).sort((a, b) => b - a);
  let prev = UNIVERSITATE_Z - 15;
  for (const cz of south.filter((z) => z < UNIVERSITATE_Z)) {
    const w = CROSS_STREETS.find((c) => c.z === cz)!.width;
    if (prev - (cz + w / 2) > 25) {
      // InterContinental stands on the east side near Universitate
      fill('W', prev, cz + w / 2 + 1);
      fill('E', prev, cz + w / 2 + 1, (zS, zN) => zN < 700 && zS > 640);
    }
    prev = cz - w / 2 - 1;
  }
  // north of Piața Romană
  const north = [ROMANA_Z - ROMANA_HALF - 8, -1055, -1065, -1274, -1286, AXIS_NORTH + 60];
  for (let i = 0; i < north.length; i += 2) {
    fill('W', north[i], north[i + 1]);
    fill('E', north[i], north[i + 1], (zS) => zS > -1010 && zS < -880); // ASE
  }
  return out;
}
