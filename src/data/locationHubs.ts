export type AuStateCode = 'NSW' | 'ACT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA' | 'NT';

export interface AustralianStateInfo {
  code: AuStateCode;
  name: string;
  aliases: string[];
  fallbackCoords?: { lat: number; lng: number };
}

export const AUSTRALIAN_STATES: AustralianStateInfo[] = [
  {
    code: 'NSW',
    name: 'New South Wales',
    aliases: ['nsw', 'new south wales'],
  },
  {
    code: 'ACT',
    name: 'Australian Capital Territory',
    aliases: ['act', 'australian capital territory'],
  },
  {
    code: 'QLD',
    name: 'Queensland',
    aliases: ['qld', 'queensland'],
  },
  {
    code: 'VIC',
    name: 'Victoria',
    aliases: ['vic', 'victoria'],
  },
  {
    code: 'TAS',
    name: 'Tasmania',
    aliases: ['tas', 'tasmania', 'tassie'],
  },
  {
    code: 'WA',
    name: 'Western Australia',
    aliases: ['wa', 'western australia', 'west australia'],
  },
  {
    code: 'SA',
    name: 'South Australia',
    aliases: ['sa', 'south australia'],
  },
  {
    code: 'NT',
    name: 'Northern Territory',
    aliases: ['nt', 'northern territory'],
    fallbackCoords: { lat: -12.4634, lng: 130.8456 },
  },
];

export const STATE_FULL_NAMES: Record<AuStateCode, string> = {
  NSW: 'New South Wales',
  ACT: 'Australian Capital Territory',
  QLD: 'Queensland',
  VIC: 'Victoria',
  TAS: 'Tasmania',
  WA: 'Western Australia',
  SA: 'South Australia',
  NT: 'Northern Territory',
};

const STATES_BY_CODE = new Map<AuStateCode, AustralianStateInfo>(
  AUSTRALIAN_STATES.map((s) => [s.code, s])
);

const STATE_BY_ALIAS = new Map<string, AustralianStateInfo>();
for (const state of AUSTRALIAN_STATES) {
  for (const alias of state.aliases) {
    STATE_BY_ALIAS.set(alias, state);
  }
}

const STATE_ALIASES_DESC = [...STATE_BY_ALIAS.keys()].sort((a, b) => b.length - a.length);

export interface LocationHub {
  id: string;
  name: string;
  state: AuStateCode;
  lat: number;
  lng: number;
  radiusKm: number;
  aliases: string[];
  postcodes?: string[];
}

export const AUSTRALIAN_LOCATION_HUBS: LocationHub[] = [
  // Capitals & Greater Metro Areas
  {
    id: 'sydney',
    name: 'Sydney',
    state: 'NSW',
    lat: -33.8688,
    lng: 151.2093,
    radiusKm: 60,
    aliases: ['sydney', 'syd', 'greater sydney', 'sydney cbd'],
    postcodes: ['2000'],
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    state: 'VIC',
    lat: -37.8136,
    lng: 144.9631,
    radiusKm: 60,
    aliases: ['melbourne', 'melb', 'greater melbourne', 'melbourne cbd'],
    postcodes: ['3000'],
  },
  {
    id: 'brisbane',
    name: 'Brisbane',
    state: 'QLD',
    lat: -27.4698,
    lng: 153.0251,
    radiusKm: 60,
    aliases: ['brisbane', 'bris', 'greater brisbane', 'brisbane cbd'],
    postcodes: ['4000'],
  },
  {
    id: 'perth',
    name: 'Perth',
    state: 'WA',
    lat: -31.9505,
    lng: 115.8605,
    radiusKm: 60,
    aliases: ['perth', 'greater perth', 'perth cbd'],
    postcodes: ['6000'],
  },
  {
    id: 'adelaide',
    name: 'Adelaide',
    state: 'SA',
    lat: -34.9285,
    lng: 138.6007,
    radiusKm: 55,
    aliases: ['adelaide', 'greater adelaide', 'adelaide cbd'],
    postcodes: ['5000'],
  },
  {
    id: 'hobart',
    name: 'Hobart',
    state: 'TAS',
    lat: -42.8821,
    lng: 147.3272,
    radiusKm: 45,
    aliases: ['hobart', 'greater hobart', 'hobart cbd'],
    postcodes: ['7000'],
  },
  {
    id: 'canberra',
    name: 'Canberra',
    state: 'ACT',
    lat: -35.2809,
    lng: 149.13,
    radiusKm: 45,
    aliases: ['canberra', 'canberra cbd'],
    postcodes: ['2600', '2601'],
  },
  {
    id: 'darwin',
    name: 'Darwin',
    state: 'NT',
    lat: -12.4634,
    lng: 130.8456,
    radiusKm: 60,
    aliases: ['darwin', 'greater darwin', 'darwin cbd'],
    postcodes: ['0800'],
  },

  // Metro Regions, Outer-Metro Growth Corridors & Coastal Belts
  {
    id: 'gold-coast',
    name: 'Gold Coast',
    state: 'QLD',
    lat: -28.0167,
    lng: 153.4,
    radiusKm: 45,
    aliases: ['gold coast', 'surfers paradise'],
    postcodes: ['4217'],
  },
  {
    id: 'sunshine-coast',
    name: 'Sunshine Coast',
    state: 'QLD',
    lat: -26.65,
    lng: 153.0667,
    radiusKm: 55,
    aliases: ['sunshine coast', 'maroochydore', 'caloundra', 'noosa'],
    postcodes: ['4558'],
  },
  {
    id: 'central-coast',
    name: 'Central Coast',
    state: 'NSW',
    lat: -33.4269,
    lng: 151.3417,
    radiusKm: 35,
    aliases: ['central coast', 'gosford', 'wyong', 'terrigal'],
    postcodes: ['2250'],
  },
  {
    id: 'newcastle',
    name: 'Newcastle',
    state: 'NSW',
    lat: -32.9283,
    lng: 151.7817,
    radiusKm: 45,
    aliases: ['newcastle', 'hunter', 'hunter valley', 'lake macquarie'],
    postcodes: ['2300'],
  },
  {
    id: 'wollongong',
    name: 'Wollongong',
    state: 'NSW',
    lat: -34.4278,
    lng: 150.8931,
    radiusKm: 35,
    aliases: ['wollongong', 'illawarra'],
    postcodes: ['2500'],
  },
  {
    id: 'geelong',
    name: 'Geelong',
    state: 'VIC',
    lat: -38.1499,
    lng: 144.3617,
    radiusKm: 35,
    aliases: ['geelong', 'bellarine', 'surf coast'],
    postcodes: ['3220'],
  },
  {
    id: 'launceston',
    name: 'Launceston',
    state: 'TAS',
    lat: -41.4332,
    lng: 147.1441,
    radiusKm: 40,
    aliases: ['launceston', 'northern tasmania'],
    postcodes: ['7250'],
  },
  {
    id: 'nw-tasmania',
    name: 'North West Tasmania',
    state: 'TAS',
    lat: -41.178,
    lng: 146.25,
    radiusKm: 55,
    aliases: [
      'north west tasmania',
      'nw tasmania',
      'north west coast',
    ],
  },
  {
    id: 'burnie',
    name: 'Burnie',
    state: 'TAS',
    lat: -41.052,
    lng: 145.906,
    radiusKm: 55,
    aliases: ['burnie'],
    postcodes: ['7320'],
  },
  {
    id: 'devonport',
    name: 'Devonport',
    state: 'TAS',
    lat: -41.179,
    lng: 146.359,
    radiusKm: 50,
    aliases: ['devonport'],
    postcodes: ['7310'],
  },
  {
    id: 'huon-valley',
    name: 'Huon Valley',
    state: 'TAS',
    lat: -43.029,
    lng: 147.053,
    radiusKm: 40,
    aliases: ['huon valley', 'huonville'],
    postcodes: ['7109'],
  },
  {
    id: 'western-sydney',
    name: 'Western Sydney',
    state: 'NSW',
    lat: -33.815,
    lng: 150.9,
    radiusKm: 45,
    aliases: ['western sydney', 'greater western sydney'],
  },
  {
    id: 'parramatta',
    name: 'Parramatta',
    state: 'NSW',
    lat: -33.815,
    lng: 151.001,
    radiusKm: 45,
    aliases: ['parramatta'],
    postcodes: ['2150'],
  },
  {
    id: 'northern-beaches',
    name: 'Northern Beaches',
    state: 'NSW',
    lat: -33.753,
    lng: 151.285,
    radiusKm: 30,
    aliases: ['northern beaches', 'manly', 'dee why'],
    postcodes: ['2099'],
  },
  {
    id: 'sutherland-shire',
    name: 'Sutherland Shire',
    state: 'NSW',
    lat: -34.031,
    lng: 151.057,
    radiusKm: 30,
    aliases: ['sutherland shire', 'the shire', 'cronulla'],
    postcodes: ['2232'],
  },
  {
    id: 'hills-district',
    name: 'Hills District',
    state: 'NSW',
    lat: -33.732,
    lng: 151.004,
    radiusKm: 30,
    aliases: ['hills district', 'the hills', 'baulkham hills', 'castle hill'],
    postcodes: ['2154'],
  },
  {
    id: 'macarthur',
    name: 'Macarthur',
    state: 'NSW',
    lat: -34.065,
    lng: 150.814,
    radiusKm: 40,
    aliases: ['macarthur', 'campbelltown', 'camden'],
    postcodes: ['2560'],
  },
  {
    id: 'mornington-peninsula',
    name: 'Mornington Peninsula',
    state: 'VIC',
    lat: -38.22,
    lng: 145.05,
    radiusKm: 45,
    aliases: ['mornington peninsula', 'mornington', 'frankston'],
    postcodes: ['3931'],
  },
  {
    id: 'gippsland',
    name: 'Gippsland',
    state: 'VIC',
    lat: -38.165,
    lng: 145.93,
    radiusKm: 75,
    aliases: ['gippsland', 'south gippsland', 'west gippsland', 'latrobe valley'],
    postcodes: ['3820'],
  },
  {
    id: 'yarra-valley',
    name: 'Yarra Valley',
    state: 'VIC',
    lat: -37.756,
    lng: 145.382,
    radiusKm: 40,
    aliases: ['yarra valley', 'lilydale'],
    postcodes: ['3770'],
  },
  {
    id: 'logan',
    name: 'Logan',
    state: 'QLD',
    lat: -27.639,
    lng: 153.109,
    radiusKm: 35,
    aliases: ['logan', 'logan city', 'loganholme'],
    postcodes: ['4114'],
  },
  {
    id: 'moreton-bay',
    name: 'Moreton Bay',
    state: 'QLD',
    lat: -27.233,
    lng: 153.017,
    radiusKm: 40,
    aliases: ['moreton bay', 'north lakes', 'redcliffe', 'caboolture'],
    postcodes: ['4509'],
  },
  {
    id: 'redlands',
    name: 'Redlands',
    state: 'QLD',
    lat: -27.53,
    lng: 153.268,
    radiusKm: 35,
    aliases: ['redlands', 'redland bay', 'cleveland'],
    postcodes: ['4163'],
  },
  {
    id: 'ipswich',
    name: 'Ipswich',
    state: 'QLD',
    lat: -27.614,
    lng: 152.761,
    radiusKm: 40,
    aliases: ['ipswich'],
    postcodes: ['4305'],
  },

  // Major Regional Cities & Outer Suburb Centres
  {
    id: 'rockhampton',
    name: 'Rockhampton',
    state: 'QLD',
    lat: -23.379,
    lng: 150.51,
    radiusKm: 60,
    aliases: ['rockhampton', 'rocky'],
    postcodes: ['4700'],
  },
  {
    id: 'townsville',
    name: 'Townsville',
    state: 'QLD',
    lat: -19.259,
    lng: 146.817,
    radiusKm: 60,
    aliases: ['townsville'],
    postcodes: ['4810'],
  },
  {
    id: 'cairns',
    name: 'Cairns',
    state: 'QLD',
    lat: -16.92,
    lng: 145.771,
    radiusKm: 60,
    aliases: ['cairns'],
    postcodes: ['4870'],
  },
  {
    id: 'toowoomba',
    name: 'Toowoomba',
    state: 'QLD',
    lat: -27.56,
    lng: 151.951,
    radiusKm: 50,
    aliases: ['toowoomba'],
    postcodes: ['4350'],
  },
  {
    id: 'mackay',
    name: 'Mackay',
    state: 'QLD',
    lat: -21.141,
    lng: 149.186,
    radiusKm: 60,
    aliases: ['mackay'],
    postcodes: ['4740'],
  },
  {
    id: 'bundaberg',
    name: 'Bundaberg',
    state: 'QLD',
    lat: -24.866,
    lng: 152.349,
    radiusKm: 60,
    aliases: ['bundaberg'],
    postcodes: ['4670'],
  },
  {
    id: 'hervey-bay',
    name: 'Hervey Bay',
    state: 'QLD',
    lat: -25.298,
    lng: 152.853,
    radiusKm: 60,
    aliases: ['hervey bay'],
    postcodes: ['4655'],
  },
  {
    id: 'gladstone',
    name: 'Gladstone',
    state: 'QLD',
    lat: -23.843,
    lng: 151.256,
    radiusKm: 60,
    aliases: ['gladstone'],
    postcodes: ['4680'],
  },
  {
    id: 'ballarat',
    name: 'Ballarat',
    state: 'VIC',
    lat: -37.562,
    lng: 143.85,
    radiusKm: 60,
    aliases: ['ballarat'],
    postcodes: ['3350'],
  },
  {
    id: 'bendigo',
    name: 'Bendigo',
    state: 'VIC',
    lat: -36.757,
    lng: 144.279,
    radiusKm: 60,
    aliases: ['bendigo'],
    postcodes: ['3550'],
  },
  {
    id: 'albury-wodonga',
    name: 'Albury-Wodonga',
    state: 'NSW',
    lat: -36.074,
    lng: 146.913,
    radiusKm: 60,
    aliases: ['albury', 'wodonga', 'albury wodonga', 'albury-wodonga'],
    postcodes: ['2640'],
  },
  {
    id: 'wagga-wagga',
    name: 'Wagga Wagga',
    state: 'NSW',
    lat: -35.108,
    lng: 147.359,
    radiusKm: 60,
    aliases: ['wagga wagga', 'wagga'],
    postcodes: ['2650'],
  },
  {
    id: 'shepparton',
    name: 'Shepparton',
    state: 'VIC',
    lat: -36.38,
    lng: 145.398,
    radiusKm: 60,
    aliases: ['shepparton'],
    postcodes: ['3630'],
  },
  {
    id: 'mildura',
    name: 'Mildura',
    state: 'VIC',
    lat: -34.185,
    lng: 142.162,
    radiusKm: 60,
    aliases: ['mildura'],
    postcodes: ['3500'],
  },
  {
    id: 'bunbury',
    name: 'Bunbury',
    state: 'WA',
    lat: -33.327,
    lng: 115.641,
    radiusKm: 60,
    aliases: ['bunbury'],
    postcodes: ['6230'],
  },
  {
    id: 'mandurah',
    name: 'Mandurah',
    state: 'WA',
    lat: -32.527,
    lng: 115.722,
    radiusKm: 50,
    aliases: ['mandurah'],
    postcodes: ['6210'],
  },
  {
    id: 'geraldton',
    name: 'Geraldton',
    state: 'WA',
    lat: -28.774,
    lng: 114.614,
    radiusKm: 60,
    aliases: ['geraldton'],
    postcodes: ['6530'],
  },
  {
    id: 'albany',
    name: 'Albany',
    state: 'WA',
    lat: -35.027,
    lng: 117.884,
    radiusKm: 60,
    aliases: ['albany'],
    postcodes: ['6330'],
  },
  {
    id: 'kalgoorlie',
    name: 'Kalgoorlie',
    state: 'WA',
    lat: -30.749,
    lng: 121.466,
    radiusKm: 60,
    aliases: ['kalgoorlie', 'kalgoorlie boulder', 'kalgoorlie-boulder'],
    postcodes: ['6430'],
  },
  {
    id: 'fremantle',
    name: 'Fremantle',
    state: 'WA',
    lat: -32.057,
    lng: 115.744,
    radiusKm: 40,
    aliases: ['fremantle', 'freo'],
    postcodes: ['6160'],
  },
  {
    id: 'rockingham',
    name: 'Rockingham',
    state: 'WA',
    lat: -32.277,
    lng: 115.73,
    radiusKm: 45,
    aliases: ['rockingham'],
    postcodes: ['6168'],
  },
  {
    id: 'mount-gambier',
    name: 'Mount Gambier',
    state: 'SA',
    lat: -37.828,
    lng: 140.783,
    radiusKm: 60,
    aliases: ['mount gambier', 'mt gambier'],
    postcodes: ['5290'],
  },
  {
    id: 'alice-springs',
    name: 'Alice Springs',
    state: 'NT',
    lat: -23.698,
    lng: 133.881,
    radiusKm: 60,
    aliases: ['alice springs'],
    postcodes: ['0870'],
  },
  {
    id: 'tamworth',
    name: 'Tamworth',
    state: 'NSW',
    lat: -31.093,
    lng: 150.932,
    radiusKm: 60,
    aliases: ['tamworth'],
    postcodes: ['2340'],
  },
  {
    id: 'coffs-harbour',
    name: 'Coffs Harbour',
    state: 'NSW',
    lat: -30.296,
    lng: 153.114,
    radiusKm: 60,
    aliases: ['coffs harbour'],
    postcodes: ['2450'],
  },
  {
    id: 'port-macquarie',
    name: 'Port Macquarie',
    state: 'NSW',
    lat: -31.431,
    lng: 152.909,
    radiusKm: 60,
    aliases: ['port macquarie', 'pt macquarie'],
    postcodes: ['2444'],
  },
  {
    id: 'lismore',
    name: 'Lismore',
    state: 'NSW',
    lat: -28.814,
    lng: 153.277,
    radiusKm: 60,
    aliases: ['lismore'],
    postcodes: ['2480'],
  },
  {
    id: 'penrith',
    name: 'Penrith',
    state: 'NSW',
    lat: -33.751,
    lng: 150.694,
    radiusKm: 45,
    aliases: ['penrith'],
    postcodes: ['2750'],
  },
  {
    id: 'berwick',
    name: 'Berwick',
    state: 'VIC',
    lat: -38.031,
    lng: 145.344,
    radiusKm: 45,
    aliases: ['berwick'],
    postcodes: ['3806'],
  },
  {
    id: 'cranbourne',
    name: 'Cranbourne',
    state: 'VIC',
    lat: -38.1,
    lng: 145.283,
    radiusKm: 45,
    aliases: ['cranbourne'],
    postcodes: ['3977'],
  },
  {
    id: 'dandenong',
    name: 'Dandenong',
    state: 'VIC',
    lat: -37.987,
    lng: 145.215,
    radiusKm: 45,
    aliases: ['dandenong'],
    postcodes: ['3175'],
  },
  {
    id: 'pakenham',
    name: 'Pakenham',
    state: 'VIC',
    lat: -38.071,
    lng: 145.488,
    radiusKm: 50,
    aliases: ['pakenham'],
    postcodes: ['3810'],
  },
];

const HUBS_BY_POSTCODE = new Map<string, LocationHub>();
for (const hub of AUSTRALIAN_LOCATION_HUBS) {
  for (const pc of hub.postcodes ?? []) {
    if (!HUBS_BY_POSTCODE.has(pc)) {
      HUBS_BY_POSTCODE.set(pc, hub);
    }
  }
}

export interface AuLocationsDataset {
  s: AuStateCode[];
  p: Record<string, [number, number, number]>;
  l: Record<string, string | string[]>;
}

export interface LocalitySuggestion {
  label: string;
  query: string;
  state: AuStateCode;
  postcode: string;
}

export function normalizeLocationText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[,./-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function expandAuAbbreviations(normalized: string): string {
  return normalized
    .replace(/^mt\s+/, 'mount ')
    .replace(/^saint\s+/, 'st ')
    .replace(/^pt\s+/, 'port ')
    .replace(/^ft\s+/, 'fort ');
}

export function extractPostcodeToken(normalized: string): string | null {
  if (/^\d{4}$/.test(normalized)) return normalized;
  const match = normalized.match(/\b(\d{4})\b/);
  return match ? match[1] : null;
}

export function parseTrailingStateHint(
  normalized: string
): { place: string; state: AustralianStateInfo } | null {
  for (const alias of STATE_ALIASES_DESC) {
    const suffix = ` ${alias}`;
    if (normalized.endsWith(suffix) && normalized.length > suffix.length) {
      const place = normalized.slice(0, normalized.length - suffix.length).trim();
      const state = STATE_BY_ALIAS.get(alias);
      if (place && state) {
        return { place, state };
      }
    }
  }
  return null;
}

export function toTitleCaseLocality(key: string): string {
  return key.replace(/(^|[\s'])\S/g, (ch) => ch.toUpperCase());
}

export function matchAustralianState(query: string): AustralianStateInfo | null {
  const q = normalizeLocationText(query);
  if (!q) return null;
  return STATE_BY_ALIAS.get(q) ?? null;
}

export function inferStateFromPostcode(postcode: string): AustralianStateInfo | null {
  const q = postcode.trim();
  if (!/^\d{4}$/.test(q)) return null;

  const pc = Number(q);
  let code: AuStateCode | null = null;

  if ((pc >= 200 && pc <= 299) || (pc >= 2600 && pc <= 2618) || (pc >= 2900 && pc <= 2920)) {
    code = 'ACT';
  } else if (pc >= 800 && pc <= 999) {
    code = 'NT';
  } else if (
    (pc >= 1000 && pc <= 2599) ||
    (pc >= 2619 && pc <= 2899) ||
    (pc >= 2921 && pc <= 2999)
  ) {
    code = 'NSW';
  } else if ((pc >= 3000 && pc <= 3999) || (pc >= 8000 && pc <= 8999)) {
    code = 'VIC';
  } else if ((pc >= 4000 && pc <= 4999) || (pc >= 9000 && pc <= 9999)) {
    code = 'QLD';
  } else if (pc >= 5000 && pc <= 5999) {
    code = 'SA';
  } else if (pc >= 6000 && pc <= 6999) {
    code = 'WA';
  } else if (pc >= 7000 && pc <= 7999) {
    code = 'TAS';
  }

  return code ? STATES_BY_CODE.get(code) ?? null : null;
}

export function matchLocationHub(
  normalizedQuery: string,
  stateFilter?: AuStateCode,
  allowPrefix = true
): LocationHub | null {
  const q = normalizeLocationText(normalizedQuery);
  if (!q) return null;

  for (const hub of AUSTRALIAN_LOCATION_HUBS) {
    if (stateFilter && hub.state !== stateFilter) continue;
    if (
      hub.aliases.some((alias) => normalizeLocationText(alias) === q) ||
      hub.postcodes?.includes(q)
    ) {
      return hub;
    }
  }

  if (allowPrefix && q.length >= 4) {
    const hasSpace = q.includes(' ');
    const prefixMatches = AUSTRALIAN_LOCATION_HUBS.filter(
      (hub) =>
        (!stateFilter || hub.state === stateFilter) &&
        hub.aliases.some((alias) => {
          const normAlias = normalizeLocationText(alias);
          if (!normAlias.startsWith(q)) return false;
          if (!hasSpace && normAlias.includes(' ')) return false;
          return true;
        })
    );
    if (prefixMatches.length === 1) {
      return prefixMatches[0];
    }
  }

  return null;
}

export function findHubByPostcode(postcode: string): LocationHub | null {
  return HUBS_BY_POSTCODE.get(postcode.trim()) ?? null;
}

let auLocationsPromise: Promise<AuLocationsDataset> | null = null;

export function loadAuLocations(): Promise<AuLocationsDataset> {
  if (!auLocationsPromise) {
    auLocationsPromise = import('./auLocations.json').then((mod) => {
      const resolved = mod as unknown as { default?: AuLocationsDataset };
      return resolved.default ?? (mod as unknown as AuLocationsDataset);
    });
  }
  return auLocationsPromise;
}

const sortedKeysCache = new WeakMap<AuLocationsDataset, string[]>();

export function getSortedLocalityKeys(dataset: AuLocationsDataset): string[] {
  let keys = sortedKeysCache.get(dataset);
  if (!keys) {
    keys = Object.keys(dataset.l).sort();
    sortedKeysCache.set(dataset, keys);
  }
  return keys;
}

export function getLocalitySuggestions(
  dataset: AuLocationsDataset,
  prefix: string,
  limit = 6
): LocalitySuggestion[] {
  const q = expandAuAbbreviations(normalizeLocationText(prefix));
  if (q.length < 3) return [];

  const keys = getSortedLocalityKeys(dataset);
  let lo = 0;
  let hi = keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (keys[mid] < q) lo = mid + 1;
    else hi = mid;
  }

  const results: LocalitySuggestion[] = [];
  for (let i = lo; i < keys.length && results.length < limit; i++) {
    const key = keys[i];
    if (!key.startsWith(q)) break;

    const entry = dataset.l[key];
    const pcs = typeof entry === 'string' ? [entry] : entry;
    const displayName = toTitleCaseLocality(key);

    for (const pc of pcs) {
      const pcInfo = dataset.p[pc];
      if (!pcInfo) continue;
      const state = dataset.s[pcInfo[2]];
      const label = `${displayName}, ${state} (${pc})`;
      results.push({
        label,
        query: `${displayName} ${state}`,
        state,
        postcode: pc,
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}
