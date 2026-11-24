import type { ChurchRecord } from '../components/AustraliaChurchMap';
import {
  AuLocationsDataset,
  AuStateCode,
  LocalitySuggestion,
  expandAuAbbreviations,
  extractPostcodeToken,
  findHubByPostcode,
  getLocalitySuggestions,
  inferStateFromPostcode,
  matchAustralianState,
  matchLocationHub,
  normalizeLocationText,
  parseTrailingStateHint,
  toTitleCaseLocality,
} from '../data/locationHubs';

export const DEFAULT_SEARCH_RADIUS_KM = 60;
export const NEAREST_FALLBACK_COUNT = 5;

export interface ChurchWithDistance {
  church: ChurchRecord;
  distanceKm: number | null;
}

export interface LocationAlternative {
  label: string;
  query: string;
  state: AuStateCode;
  postcode: string;
}

export type SearchBannerKind =
  | 'none'
  | 'state'
  | 'state-no-local'
  | 'nearby'
  | 'nearest-fallback'
  | 'postcode-state-fallback'
  | 'direct'
  | 'invalid-postcode'
  | 'no-match';

export interface ChurchSearchResult {
  churches: ChurchWithDistance[];
  bannerKind: SearchBannerKind;
  locationLabel: string | null;
  radiusKm: number | null;
  postcode?: string;
  stateName?: string;
  alternatives: LocationAlternative[];
  suggestions: LocalitySuggestion[];
  isLoadingLocations: boolean;
  bypassedStateFilter: boolean;
}

export interface SearchChurchesParams {
  allChurches: ChurchRecord[];
  query: string;
  selectedState: string;
  userCoords: { lat: number; lng: number } | null;
  auLocations: AuLocationsDataset | null;
  locationsLoading: boolean;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function churchMatchesQuery(
  church: ChurchRecord,
  normalizedQuery: string,
  rawLowerQuery: string
): boolean {
  const raw = `${church.name} ${church.suburb} ${church.classis} ${church.address} ${church.postcode} ${church.serviceTimes ?? ''}`;
  if (raw.toLowerCase().includes(rawLowerQuery)) return true;
  const haystack = normalizeLocationText(raw);
  if (haystack.includes(normalizedQuery)) return true;
  // Word-by-word: "canberra reformed" or "hobart crc" match even when words aren't adjacent.
  const words = normalizedQuery.split(' ').filter((w) => w.length > 1);
  return words.length > 1 && words.every((w) => haystack.includes(w));
}

function attachUserDistance(
  churches: ChurchRecord[],
  userCoords: { lat: number; lng: number } | null
): ChurchWithDistance[] {
  const list = churches.map((church) => ({
    church,
    distanceKm: userCoords
      ? haversineKm(userCoords.lat, userCoords.lng, church.lat, church.lng)
      : null,
  }));
  if (userCoords) {
    list.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  } else {
    // No location to sort by: list churches alphabetically.
    list.sort((a, b) => a.church.name.localeCompare(b.church.name, 'en-AU'));
  }
  return list;
}

function resolveLocalityKey(
  auLocations: AuLocationsDataset | null,
  normalized: string,
  expanded: string
): string | null {
  if (!auLocations) return null;
  if (auLocations.l[expanded]) return expanded;
  if (auLocations.l[normalized]) return normalized;
  return null;
}

function buildLocalityAlternatives(
  auLocations: AuLocationsDataset | null,
  localityKey: string | null,
  excludeStates: Set<AuStateCode>
): LocationAlternative[] {
  if (!auLocations || !localityKey) return [];
  const entry = auLocations.l[localityKey];
  if (!entry) return [];

  const pcs = typeof entry === 'string' ? [entry] : entry;
  const displayName = toTitleCaseLocality(localityKey);
  const alternatives: LocationAlternative[] = [];

  for (const pc of pcs) {
    const info = auLocations.p[pc];
    if (!info) continue;
    const state = auLocations.s[info[2]];
    if (excludeStates.has(state)) continue;
    alternatives.push({
      label: `${displayName}, ${state} (${pc})`,
      query: `${displayName} ${state}`,
      state,
      postcode: pc,
    });
  }

  return alternatives;
}

function pickBestPostcodeForLocality(
  pcs: string[],
  allChurches: ChurchRecord[],
  auLocations: AuLocationsDataset,
  selectedState: string
): { pc: string; lat: number; lng: number; state: AuStateCode } | null {
  const candidates: Array<{ pc: string; lat: number; lng: number; state: AuStateCode }> = [];
  for (const pc of pcs) {
    const info = auLocations.p[pc];
    if (!info) continue;
    candidates.push({
      pc,
      lat: info[0],
      lng: info[1],
      state: auLocations.s[info[2]],
    });
  }
  if (candidates.length === 0) return null;

  if (selectedState !== 'ALL') {
    const stateCandidate = candidates.find((c) => c.state === selectedState);
    if (stateCandidate) return stateCandidate;
  }

  let best = candidates[0];
  let bestMinKm = Infinity;
  for (const candidate of candidates) {
    let minKm = Infinity;
    for (const church of allChurches) {
      const km = haversineKm(candidate.lat, candidate.lng, church.lat, church.lng);
      if (km < minKm) minKm = km;
    }
    if (minKm < bestMinKm) {
      bestMinKm = minKm;
      best = candidate;
    }
  }
  return best;
}

function emptyResult(overrides: Partial<ChurchSearchResult> = {}): ChurchSearchResult {
  return {
    churches: [],
    bannerKind: 'no-match',
    locationLabel: null,
    radiusKm: null,
    alternatives: [],
    suggestions: [],
    isLoadingLocations: false,
    bypassedStateFilter: false,
    ...overrides,
  };
}

export function searchChurches({
  allChurches,
  query,
  selectedState,
  userCoords,
  auLocations,
  locationsLoading,
}: SearchChurchesParams): ChurchSearchResult {
  const rawLower = query.trim().toLowerCase();
  const normalized = normalizeLocationText(query);

  const baseList =
    selectedState === 'ALL'
      ? allChurches
      : allChurches.filter((c) => c.state === selectedState);

  // 1. Empty query: filter by selected state and optionally sort by browser geolocation
  if (!normalized) {
    return {
      churches: attachUserDistance(baseList, userCoords),
      bannerKind: 'none',
      locationLabel: null,
      radiusKm: null,
      alternatives: [],
      suggestions: [],
      isLoadingLocations: false,
      bypassedStateFilter: false,
    };
  }

  function runProximitySearch(
    lat: number,
    lng: number,
    radiusKm: number,
    targetState: AuStateCode,
    label: string,
    alternatives: LocationAlternative[],
    extraIncluded?: (church: ChurchRecord) => boolean
  ): ChurchSearchResult {
    const canUseBaseList = selectedState === 'ALL' || selectedState === targetState;
    const candidates = canUseBaseList ? baseList : allChurches;

    const sortedCandidates = candidates
      .map((church) => ({
        church,
        distanceKm: haversineKm(lat, lng, church.lat, church.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const withinRadius = sortedCandidates.filter(
      (item) => item.distanceKm <= radiusKm || (extraIncluded?.(item.church) ?? false)
    );

    if (withinRadius.length > 0) {
      return {
        churches: withinRadius,
        bannerKind: 'nearby',
        locationLabel: label,
        radiusKm,
        alternatives,
        suggestions: [],
        isLoadingLocations: false,
        bypassedStateFilter: !canUseBaseList,
      };
    }

    const nearestAll = allChurches
      .map((church) => ({
        church,
        distanceKm: haversineKm(lat, lng, church.lat, church.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, NEAREST_FALLBACK_COUNT);

    return {
      churches: nearestAll,
      bannerKind: 'nearest-fallback',
      locationLabel: label,
      radiusKm,
      alternatives,
      suggestions: [],
      isLoadingLocations: false,
      bypassedStateFilter:
        !canUseBaseList ||
        (selectedState !== 'ALL' && nearestAll.some((item) => item.church.state !== selectedState)),
    };
  }

  // 2. Exact Australian state / territory name or abbreviation
  const stateMatch = matchAustralianState(normalized);
  if (stateMatch) {
    const matches = allChurches.filter((c) => c.state === stateMatch.code);
    const bypassedStateFilter = selectedState !== 'ALL' && selectedState !== stateMatch.code;

    if (matches.length === 0) {
      const origin = stateMatch.fallbackCoords ?? userCoords;
      const nearest = attachUserDistance(allChurches, origin).slice(0, NEAREST_FALLBACK_COUNT);
      return {
        churches: nearest,
        bannerKind: 'state-no-local',
        locationLabel: stateMatch.name,
        radiusKm: null,
        stateName: stateMatch.name,
        alternatives: [],
        suggestions: [],
        isLoadingLocations: false,
        bypassedStateFilter,
      };
    }

    return {
      churches: attachUserDistance(matches, userCoords),
      bannerKind: 'state',
      locationLabel: stateMatch.name,
      radiusKm: null,
      stateName: stateMatch.name,
      alternatives: [],
      suggestions: [],
      isLoadingLocations: false,
      bypassedStateFilter,
    };
  }

  // 3. 4-digit Australian postcode token (standalone or embedded, e.g. "Penrith 2750")
  const postcode = extractPostcodeToken(normalized);
  if (postcode) {
    const pcInfo = auLocations?.p[postcode];
    if (pcInfo && auLocations) {
      const [lat, lng, stIdx] = pcInfo;
      const stCode = auLocations.s[stIdx];
      const hub = findHubByPostcode(postcode);
      const label = hub ? `${hub.name} (${postcode})` : `postcode ${postcode} (${stCode})`;
      return runProximitySearch(lat, lng, DEFAULT_SEARCH_RADIUS_KM, stCode, label, []);
    }

    if (!auLocations) {
      const hub = findHubByPostcode(postcode);
      if (hub) {
        return runProximitySearch(
          hub.lat,
          hub.lng,
          DEFAULT_SEARCH_RADIUS_KM,
          hub.state,
          `${hub.name} (${postcode})`,
          []
        );
      }
      if (locationsLoading) {
        return emptyResult({ bannerKind: 'none', postcode, isLoadingLocations: true });
      }
    }

    const inferred = inferStateFromPostcode(postcode);
    if (inferred) {
      const matches = allChurches.filter((c) => c.state === inferred.code);
      const bypassedStateFilter = selectedState !== 'ALL' && selectedState !== inferred.code;

      if (matches.length === 0) {
        const origin = inferred.fallbackCoords ?? userCoords;
        const nearest = attachUserDistance(allChurches, origin).slice(0, NEAREST_FALLBACK_COUNT);
        return {
          churches: nearest,
          bannerKind: 'postcode-state-fallback',
          locationLabel: inferred.name,
          radiusKm: null,
          postcode,
          stateName: inferred.name,
          alternatives: [],
          suggestions: [],
          isLoadingLocations: false,
          bypassedStateFilter,
        };
      }

      return {
        churches: attachUserDistance(matches, userCoords),
        bannerKind: 'postcode-state-fallback',
        locationLabel: inferred.name,
        radiusKm: null,
        postcode,
        stateName: inferred.name,
        alternatives: [],
        suggestions: [],
        isLoadingLocations: false,
        bypassedStateFilter,
      };
    }

    return emptyResult({ bannerKind: 'invalid-postcode', postcode });
  }

  // 4. Explicit trailing state hint (e.g. "Campbelltown SA", "Kingston QLD", "Perth TAS")
  const trailingState = parseTrailingStateHint(normalized);
  if (trailingState) {
    const place = expandAuAbbreviations(trailingState.place);
    const resolvedTrailingKey = resolveLocalityKey(auLocations, trailingState.place, place);
    const hub = matchLocationHub(place, trailingState.state.code, true);
    if (hub) {
      const alternatives = buildLocalityAlternatives(
        auLocations,
        resolvedTrailingKey,
        new Set<AuStateCode>([hub.state])
      );
      return runProximitySearch(
        hub.lat,
        hub.lng,
        hub.radiusKm,
        hub.state,
        `${hub.name}, ${hub.state}`,
        alternatives,
        (c) => c.state === hub.state && churchMatchesQuery(c, place, place)
      );
    }

    if (auLocations) {
      const entry = resolvedTrailingKey ? auLocations.l[resolvedTrailingKey] : undefined;
      if (entry && resolvedTrailingKey) {
        const pcs = typeof entry === 'string' ? [entry] : entry;
        const matchedPc = pcs.find((pc) => {
          const info = auLocations.p[pc];
          return info && auLocations.s[info[2]] === trailingState.state.code;
        });
        if (matchedPc) {
          const [lat, lng, stIdx] = auLocations.p[matchedPc];
          const stCode = auLocations.s[stIdx];
          const alternatives = buildLocalityAlternatives(
            auLocations,
            resolvedTrailingKey,
            new Set<AuStateCode>([stCode])
          );
          return runProximitySearch(
            lat,
            lng,
            DEFAULT_SEARCH_RADIUS_KM,
            stCode,
            `${toTitleCaseLocality(resolvedTrailingKey)}, ${stCode} (${matchedPc})`,
            alternatives
          );
        }
      }
    } else if (locationsLoading) {
      return emptyResult({ bannerKind: 'none', isLoadingLocations: true });
    }
  }

  const expanded = expandAuAbbreviations(normalized);
  const resolvedKey = resolveLocalityKey(auLocations, normalized, expanded);

  function hasSelectedStateLocalityMatch(localityKey: string | null): boolean {
    if (selectedState === 'ALL' || !auLocations || !localityKey) return false;
    const entry = auLocations.l[localityKey];
    if (!entry) return false;
    const pcs = typeof entry === 'string' ? [entry] : entry;
    return pcs.some((pc) => {
      const info = auLocations.p[pc];
      return info && auLocations.s[info[2]] === selectedState;
    });
  }

  // 5. Curated major metro & regional hubs (exact aliases/postcodes only here to avoid prefix hijacking)
  const exactHub = matchLocationHub(normalized, undefined, false);
  if (exactHub) {
    const shouldDeferToStateTab =
      selectedState !== 'ALL' &&
      selectedState !== exactHub.state &&
      hasSelectedStateLocalityMatch(resolvedKey);

    if (!shouldDeferToStateTab) {
      const alternatives = buildLocalityAlternatives(
        auLocations,
        resolvedKey,
        new Set<AuStateCode>([exactHub.state])
      );
      return runProximitySearch(
        exactHub.lat,
        exactHub.lng,
        exactHub.radiusKm,
        exactHub.state,
        `${exactHub.name}, ${exactHub.state}`,
        alternatives,
        (c) => c.state === exactHub.state && churchMatchesQuery(c, normalized, rawLower)
      );
    }
  }

  // 6. Direct church text match (name, suburb, classis, address, postcode)
  const directMatches = baseList.filter((c) => churchMatchesQuery(c, normalized, rawLower));
  if (directMatches.length > 0) {
    const matchedStates = new Set<AuStateCode>(directMatches.map((c) => c.state));
    const alternatives = buildLocalityAlternatives(auLocations, resolvedKey, matchedStates);
    return {
      churches: attachUserDistance(directMatches, userCoords),
      bannerKind: 'direct',
      locationLabel: null,
      radiusKm: null,
      alternatives,
      suggestions: [],
      isLoadingLocations: false,
      bypassedStateFilter: false,
    };
  }

  // 7. Full Australian suburb / locality lookup (and unique hub prefix fallback)
  if (auLocations && resolvedKey) {
    const exactEntry = auLocations.l[resolvedKey];
    const pcs = typeof exactEntry === 'string' ? [exactEntry] : exactEntry;
    const chosen = pickBestPostcodeForLocality(pcs, allChurches, auLocations, selectedState);
    if (chosen) {
      const alternatives = buildLocalityAlternatives(
        auLocations,
        resolvedKey,
        new Set<AuStateCode>([chosen.state])
      );
      return runProximitySearch(
        chosen.lat,
        chosen.lng,
        DEFAULT_SEARCH_RADIUS_KM,
        chosen.state,
        `${toTitleCaseLocality(resolvedKey)}, ${chosen.state} (${chosen.pc})`,
        alternatives
      );
    }
  }

  if (!auLocations && locationsLoading) {
    return emptyResult({ bannerKind: 'none', isLoadingLocations: true });
  }

  const prefixHub = matchLocationHub(normalized, undefined, true);
  if (prefixHub) {
    const shouldDeferToStateTab =
      selectedState !== 'ALL' &&
      selectedState !== prefixHub.state &&
      hasSelectedStateLocalityMatch(resolvedKey);

    if (!shouldDeferToStateTab) {
      const alternatives = buildLocalityAlternatives(
        auLocations,
        resolvedKey,
        new Set<AuStateCode>([prefixHub.state])
      );
      return runProximitySearch(
        prefixHub.lat,
        prefixHub.lng,
        prefixHub.radiusKm,
        prefixHub.state,
        `${prefixHub.name}, ${prefixHub.state}`,
        alternatives
      );
    }
  }

  if (!auLocations) {
    return emptyResult({ bannerKind: 'no-match' });
  }

  if (expanded.length >= 4) {
    const suggestions = getLocalitySuggestions(auLocations, expanded, 6);
    if (suggestions.length === 1) {
      const single = suggestions[0];
      const info = auLocations.p[single.postcode];
      if (info) {
        const [lat, lng, stIdx] = info;
        const stCode = auLocations.s[stIdx];
        return runProximitySearch(
          lat,
          lng,
          DEFAULT_SEARCH_RADIUS_KM,
          stCode,
          single.label,
          []
        );
      }
    }
    return emptyResult({ bannerKind: 'no-match', suggestions });
  }

  // 8. Unmatched fallback with autocomplete suggestions for 3+ character prefixes
  const suggestions = expanded.length >= 3 ? getLocalitySuggestions(auLocations, expanded, 6) : [];
  return emptyResult({ bannerKind: 'no-match', suggestions });
}
