import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from 'lucide-react';
import churchesRaw from '../data/churches.json';
import { AuLocationsDataset, loadAuLocations } from '../data/locationHubs';
import { searchChurches } from '../utils/churchSearch';
import { handleTabListKeyDown } from '../utils/tablistKeyboard';
import { AustraliaChurchMap, ChurchRecord, getDirectionsUrl } from './AustraliaChurchMap';

const MOBILE_LIST_LIMIT = 8;

const allChurches = churchesRaw as ChurchRecord[];

const stateOrder: Array<'ALL' | ChurchRecord['state']> = [
  'ALL',
  'NSW',
  'ACT',
  'QLD',
  'VIC',
  'TAS',
  'WA',
  'SA',
];

const QUICK_STATE_CODES: ChurchRecord['state'][] = [
  'NSW',
  'ACT',
  'QLD',
  'VIC',
  'TAS',
  'WA',
  'SA',
];

interface ChurchDirectoryProps {
  id?: string;
  externalQuery?: string;
  initialStateFilter?: string;
  onFiltersChange?: (updates: { query?: string; state?: string }) => void;
}

export function ChurchDirectory({
  id,
  externalQuery,
  initialStateFilter = 'ALL',
  onFiltersChange,
}: ChurchDirectoryProps) {
  const [query, setQuery] = useState(externalQuery ?? '');
  const [selectedState, setSelectedState] = useState<string>(() => {
    const upper = initialStateFilter.toUpperCase();
    return stateOrder.includes(upper as (typeof stateOrder)[number]) ? upper : 'ALL';
  });
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
  const [selectionNonce, setSelectionNonce] = useState(0);
  // Mobile only: show a short list first so the page isn't 50+ cards tall.
  const [showAllMobile, setShowAllMobile] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [auLocations, setAuLocations] = useState<AuLocationsDataset | null>(null);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const geoRequestIdRef = useRef(0);

  useEffect(() => {
    let active = true;
    loadAuLocations()
      .then((data) => {
        if (active) {
          setAuLocations(data);
          setLocationsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLocationsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (externalQuery !== undefined) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  useEffect(() => {
    const upper = initialStateFilter.toUpperCase();
    setSelectedState(
      stateOrder.includes(upper as (typeof stateOrder)[number]) ? upper : 'ALL'
    );
  }, [initialStateFilter]);

  function clearUserLocation() {
    geoRequestIdRef.current += 1;
    setLocating(false);
    setUserCoords(null);
    setLocationError(null);
  }

  function handleQueryInput(next: string) {
    if (next.trim().length > 0) {
      geoRequestIdRef.current += 1;
      setLocating(false);
      setUserCoords(null);
    }
    setLocationError(null);
    setQuery(next);
    setSelectedChurchId(null);
    onFiltersChange?.({ query: next });
  }

  function handleStateSelect(nextState: string) {
    setSelectedState(nextState);
    setSelectedChurchId(null);
    setLocationError(null);
    onFiltersChange?.({ state: nextState });
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location services are not supported by your browser.');
      return;
    }
    const reqId = ++geoRequestIdRef.current;
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (reqId !== geoRequestIdRef.current) return;
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setQuery('');
        setSelectedChurchId(null);
        onFiltersChange?.({ query: '' });
        setLocating(false);
      },
      () => {
        if (reqId !== geoRequestIdRef.current) return;
        setLocationError(
          'Unable to access your location. Please allow location permissions or search by suburb/postcode.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allChurches.length };
    for (const c of allChurches) {
      counts[c.state] = (counts[c.state] ?? 0) + 1;
    }
    return counts;
  }, []);

  const searchResult = useMemo(
    () =>
      searchChurches({
        allChurches,
        query,
        selectedState,
        userCoords,
        auLocations,
        locationsLoading,
      }),
    [query, selectedState, userCoords, auLocations, locationsLoading]
  );

  const filteredChurches = searchResult.churches;

  useEffect(() => {
    if (
      selectedChurchId &&
      !filteredChurches.some((item) => item.church.id === selectedChurchId)
    ) {
      setSelectedChurchId(null);
    }
  }, [filteredChurches, selectedChurchId]);

  const mapChurches = useMemo(
    () => filteredChurches.map((item) => item.church),
    [filteredChurches]
  );

  function handleSelectFromMap(churchId: string) {
    setSelectedChurchId(churchId);
    setShowAllMobile(true);
    const isDesktop =
      typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;
    const el = cardRefs.current[churchId];
    if (el) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
  }

  function handleSelectFromCard(churchId: string) {
    setSelectedChurchId(churchId);
    setSelectionNonce((n) => n + 1);
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      mapWrapperRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  function resetAllFilters() {
    geoRequestIdRef.current += 1;
    setLocating(false);
    setQuery('');
    setSelectedState('ALL');
    setSelectedChurchId(null);
    setUserCoords(null);
    setLocationError(null);
    onFiltersChange?.({ query: '', state: 'ALL' });
  }

  const idPrefix = id || 'church-directory';
  const tabPrefix = `${idPrefix}-state`;
  const panelId = `${idPrefix}-church-results`;

  return (
    <section
      id={id}
      aria-label="CRCA Church Finder Directory and Map"
      className="bg-stone-50 py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filter Controls Card */}
        <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" />
              <input
                type="search"
                value={query}
                onChange={(e) => handleQueryInput(e.target.value)}
                placeholder="Search church, suburb, city (e.g. Rockhampton), state (e.g. NSW), or any AU postcode..."
                aria-label="Filter churches by name, suburb, city, postcode, or state"
                className="w-full rounded-md border border-stone-300 bg-stone-50 py-2.5 pl-10 pr-10 text-sm text-navy-900 placeholder:text-stone-600 focus:border-teal-500 focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryInput('')}
                  aria-label="Clear church search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-600 hover:bg-stone-200 hover:text-navy-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={userCoords ? clearUserLocation : handleUseMyLocation}
                disabled={locating}
                aria-pressed={Boolean(userCoords)}
                title={userCoords ? 'Turn off location sorting' : undefined}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold text-white transition-colors disabled:opacity-70 ${
                  userCoords
                    ? 'bg-navy-900 hover:bg-navy-800'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                <span>
                  {locating ? 'Locating...' : userCoords ? 'Sorted by Nearest' : 'Use My Location'}
                </span>
                {userCoords && !locating && (
                  <>
                    <X className="h-3.5 w-3.5 text-teal-200" aria-hidden="true" />
                    <span className="sr-only"> (click to turn off)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* State Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
            <div role="tablist" aria-label="Filter congregations by Australian state" className="flex flex-wrap gap-1.5">
              {stateOrder.map((stateCode) => {
                const active = selectedState === stateCode;
                const count = stateCounts[stateCode] ?? 0;
                return (
                  <button
                    key={stateCode}
                    id={`${tabPrefix}-tab-${stateCode}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={panelId}
                    tabIndex={active ? 0 : -1}
                    onClick={() => handleStateSelect(stateCode)}
                    onKeyDown={(e) =>
                      handleTabListKeyDown(
                        e,
                        stateOrder,
                        selectedState as (typeof stateOrder)[number],
                        handleStateSelect,
                        tabPrefix
                      )
                    }
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-navy-900 text-white'
                        : 'bg-stone-100 text-navy-800 hover:bg-stone-200'
                    }`}
                  >
                    {stateCode === 'ALL' ? `All (${count})` : `${stateCode} (${count})`}
                  </button>
                );
              })}
            </div>

            <span role="status" aria-live="polite" className="text-xs font-semibold text-stone-600">
              {searchResult.isLoadingLocations
                ? 'Looking up Australian location...'
                : `Showing ${filteredChurches.length} of ${allChurches.length} congregations`}
            </span>
          </div>

          {(searchResult.bannerKind === 'state' ||
            searchResult.bannerKind === 'state-no-local' ||
            searchResult.bannerKind === 'nearby' ||
            searchResult.bannerKind === 'nearest-fallback' ||
            searchResult.bannerKind === 'postcode-state-fallback' ||
            (searchResult.bannerKind === 'direct' && searchResult.alternatives.length > 0) ||
            (Boolean(userCoords) && searchResult.bannerKind === 'none')) && (
            <div className="mt-3 rounded-lg bg-teal-50 border border-teal-100 px-3 py-2 text-xs font-medium text-navy-900">
              {userCoords && searchResult.bannerKind === 'none' && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>Showing congregations sorted by distance from your location.</p>
                  <button
                    type="button"
                    onClick={clearUserLocation}
                    className="font-semibold text-teal-800 underline decoration-teal-500/50 hover:text-navy-900"
                  >
                    Clear location
                  </button>
                </div>
              )}

              {searchResult.bannerKind === 'state' && (
                <p>
                  Showing congregations in <strong>{searchResult.stateName}</strong>
                  {searchResult.bypassedStateFilter && selectedState !== 'ALL'
                    ? ` (showing outside ${selectedState} filter)`
                    : ''}
                  .
                </p>
              )}

              {searchResult.bannerKind === 'state-no-local' && (
                <p>
                  There isn&apos;t currently a CRCA congregation in the{' '}
                  <strong>{searchResult.stateName}</strong>. Showing the{' '}
                  {filteredChurches.length} nearest congregations—many also share Sunday
                  livestreams and podcasts.
                </p>
              )}

              {searchResult.bannerKind === 'nearby' && (
                <p>
                  Showing congregations near <strong>{searchResult.locationLabel}</strong>, sorted
                  by distance
                  {searchResult.bypassedStateFilter && selectedState !== 'ALL'
                    ? ` (showing outside ${selectedState} filter)`
                    : ''}
                  .
                </p>
              )}

              {searchResult.bannerKind === 'nearest-fallback' && (
                <p>
                  There isn&apos;t a CRCA congregation within {searchResult.radiusKm} km of{' '}
                  <strong>{searchResult.locationLabel}</strong>. Showing the{' '}
                  {filteredChurches.length} nearest congregations—many also share Sunday
                  livestreams and podcasts.
                </p>
              )}

              {searchResult.bannerKind === 'postcode-state-fallback' && (
                <p>
                  Postcode <strong>{searchResult.postcode}</strong> isn&apos;t in our coordinate
                  index yet—showing congregations in <strong>{searchResult.stateName}</strong>.
                </p>
              )}

              {searchResult.alternatives.length > 0 && (
                <div
                  className={`${
                    searchResult.bannerKind === 'direct' ? '' : 'mt-2 pt-2 border-t border-teal-100/80 '
                  }flex flex-wrap items-center gap-1.5`}
                >
                  <span className="text-[11px] font-semibold text-stone-700">
                    {searchResult.bannerKind === 'direct'
                      ? 'Looking for another state?'
                      : 'Other locations:'}
                  </span>
                  {searchResult.alternatives.map((alt) => (
                    <button
                      key={`${alt.state}-${alt.postcode}`}
                      type="button"
                      onClick={() => handleQueryInput(alt.query)}
                      className="rounded-full border border-teal-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 transition-colors hover:bg-teal-100"
                    >
                      {alt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {locationError && (
            <div
              role="alert"
              className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-gold-50 border border-gold-400/50 px-3 py-2 text-xs text-navy-900"
            >
              <p>{locationError}</p>
              <button
                type="button"
                onClick={() => setLocationError(null)}
                aria-label="Dismiss location message"
                className="shrink-0 rounded p-0.5 text-navy-800 hover:bg-gold-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Split-View: Cards List + Leaflet Australian Map */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${tabPrefix}-tab-${selectedState}`}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          {/* Left: Filterable Church Cards */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            {searchResult.isLoadingLocations ? (
              <div className="rounded-lg border border-stone-200 bg-white p-10 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
                <h3 className="mt-3 font-serif text-lg font-bold text-navy-900">
                  Looking up Australian location...
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  Loading Australia-wide postcode and suburb coordinates.
                </p>
              </div>
            ) : filteredChurches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center sm:p-10">
                <MapPin className="mx-auto h-8 w-8 text-stone-600" />
                <h3 className="mt-3 font-serif text-lg font-bold text-navy-900">
                  {searchResult.bannerKind === 'invalid-postcode'
                    ? 'Unrecognised Australian postcode'
                    : 'No matching church or location found'}
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  {searchResult.bannerKind === 'invalid-postcode'
                    ? `"${searchResult.postcode}" doesn't match an Australian postcode range. Try a 4-digit Australian postcode (e.g. 2750, 3806, 4509), a suburb, or browse by state below.`
                    : `Try a suburb, city, 4-digit Australian postcode, or choose a state below to browse our ${allChurches.length} congregations.`}
                </p>

                {searchResult.suggestions.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-stone-700">Did you mean:</div>
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                      {searchResult.suggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.state}-${suggestion.postcode}-${suggestion.label}`}
                          type="button"
                          onClick={() => handleQueryInput(suggestion.query)}
                          className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                  {QUICK_STATE_CODES.map((stateCode) => (
                    <button
                      key={stateCode}
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setSelectedState(stateCode);
                        setSelectedChurchId(null);
                        setLocationError(null);
                        onFiltersChange?.({ query: '', state: stateCode });
                      }}
                      className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-navy-800 transition-colors hover:border-teal-500 hover:bg-teal-50"
                    >
                      {stateCode}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="relative lg:max-h-[42rem] lg:overflow-y-auto lg:pr-2">
                {filteredChurches.map(({ church, distanceKm }, i) => {
                  const isSelected = church.id === selectedChurchId;
                  const directionsUrl = getDirectionsUrl(church);

                  return (
                    <article
                      key={church.id}
                      ref={(el) => {
                        cardRefs.current[church.id] = el;
                      }}
                      onClick={() => handleSelectFromCard(church.id)}
                      className={`cursor-pointer border-b border-stone-200 bg-white px-1 py-5 transition-colors first:border-t ${
                        !showAllMobile && i >= MOBILE_LIST_LIMIT ? 'max-lg:hidden ' : ''
                      }${
                        isSelected
                          ? 'border-l-4 border-l-teal-500 bg-teal-50/60 pl-4'
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-xl font-semibold leading-snug text-navy-900">
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectFromCard(church.id);
                            }}
                            className="text-left hover:text-teal-700 focus-visible:underline"
                          >
                            {church.name}
                          </button>
                        </h3>
                        <span className="shrink-0 pt-1 text-sm text-stone-500">
                          {distanceKm !== null
                            ? distanceKm < 1
                              ? '< 1 km'
                              : `${distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} km`
                            : church.state}
                        </span>
                      </div>

                      <dl className="mt-2 space-y-1 text-[0.95rem] text-stone-700">
                        {church.serviceTimes && (
                          <div className="flex gap-2">
                            <dt className="sr-only">Sunday services</dt>
                            <Clock className="mt-1 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                            <dd className="font-medium text-navy-900">Sundays {church.serviceTimes}</dd>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <dt className="sr-only">Address</dt>
                          <MapPin className="mt-1 h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                          <dd>{church.address}</dd>
                        </div>
                      </dl>

                      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-700 underline-offset-4 hover:underline">
                          Directions
                        </a>
                        {church.website && (
                          <a href={church.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-700 underline-offset-4 hover:underline">
                            Website
                          </a>
                        )}
                        {(church.youtube || church.videoUrl) && (
                          <a href={church.youtube ?? church.videoUrl ?? ''} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-700 underline-offset-4 hover:underline">
                            {church.youtube ? 'YouTube' : 'Livestream'}
                          </a>
                        )}
                        {church.facebook && (
                          <a href={church.facebook} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-700 underline-offset-4 hover:underline">
                            {church.livestreamOnFacebook ? 'Facebook livestream' : 'Facebook'}
                          </a>
                        )}
                        {church.podcast && (
                          <a href={church.podcast} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-700 underline-offset-4 hover:underline">
                            Podcast
                          </a>
                        )}
                      </p>
                    </article>
                  );
                })}
                {!showAllMobile && filteredChurches.length > MOBILE_LIST_LIMIT && (
                  <button
                    type="button"
                    onClick={() => setShowAllMobile(true)}
                    className="w-full rounded-lg border border-dashed border-teal-500/50 bg-teal-50 px-5 py-4 text-sm font-semibold text-teal-800 hover:bg-teal-100 lg:hidden"
                  >
                    Show all {filteredChurches.length} churches
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Interactive Australian Map */}
          <div
            ref={mapWrapperRef}
            className="lg:col-span-7 order-1 lg:order-2 scroll-mt-[calc(var(--site-header-height,72px)+1rem)]"
          >
            <AustraliaChurchMap
              churches={mapChurches}
              selectedChurchId={selectedChurchId}
              selectionNonce={selectionNonce}
              onSelectChurch={handleSelectFromMap}
              totalChurchCount={allChurches.length}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
