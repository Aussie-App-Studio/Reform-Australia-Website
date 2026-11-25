import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  AustraliaChurchMapProps,
  buildPopupHtml,
  ChurchRecord,
  distanceKm,
  getColocatedGroups,
  getDirectionsUrl,
} from './churchMapShared';

export type { ChurchRecord };
export { getDirectionsUrl };

maplibregl.setWorkerUrl(workerUrl);

const AustraliaChurchMapLeaflet = lazy(() =>
  import('./AustraliaChurchMapLeaflet').then((m) => ({
    default: m.AustraliaChurchMapLeaflet,
  }))
);

const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const AUSTRALIA_CENTER: [number, number] = [133.8, -28.2];
const AUSTRALIA_DEFAULT_ZOOM = 3.15;
const AUSTRALIA_MIN_ZOOM = 3.0;
// Southwest [lng, lat] to Northeast [lng, lat] bounding box around Australia with ocean buffer
const AUSTRALIA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [95.0, -52.0],
  [172.0, -3.0],
];

function applyPinStyling(el: HTMLElement, isSelected: boolean): void {
  const dot = el.querySelector<HTMLElement>('[data-pin-dot]');
  if (!dot) return;

  el.style.zIndex = isSelected ? '500' : '10';
  el.classList.toggle('crca-map-pin-selected', isSelected);
  el.classList.toggle('crca-map-pin', !isSelected);

  if (isSelected) {
    dot.style.width = '24px';
    dot.style.height = '24px';
    dot.style.borderRadius = '9999px';
    dot.style.background = '#00224c';
    dot.style.border = '3px solid #ffffff';
    dot.style.boxShadow = '0 0 0 4px rgba(197,155,67,0.55), 0 4px 10px rgba(0,34,76,0.4)';
    dot.style.transition = 'transform 150ms ease, background-color 150ms ease';
  } else {
    dot.style.width = '16px';
    dot.style.height = '16px';
    dot.style.borderRadius = '9999px';
    dot.style.background = '#00a6ca';
    dot.style.border = '2.5px solid #ffffff';
    dot.style.boxShadow = '0 2px 6px rgba(0,34,76,0.35)';
    dot.style.transition = 'transform 150ms ease, background-color 150ms ease';
  }
}

function createPinElement(church: ChurchRecord, isSelected: boolean): HTMLElement {
  const wrapper = document.createElement('button');
  wrapper.type = 'button';
  wrapper.title = church.name;
  wrapper.setAttribute('aria-label', church.name);
  wrapper.style.background = 'transparent';
  wrapper.style.border = 'none';
  wrapper.style.padding = '4px';
  wrapper.style.margin = '0';
  wrapper.style.cursor = 'pointer';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';

  const dot = document.createElement('div');
  dot.setAttribute('data-pin-dot', 'true');
  wrapper.appendChild(dot);

  applyPinStyling(wrapper, isSelected);
  return wrapper;
}

/**
 * Separates co-located markers (e.g. two congregations sharing one property)
 * once zoomed in so both pins remain visible and independently clickable.
 */
function layoutColocatedMarkers(
  map: maplibregl.Map,
  churches: ChurchRecord[],
  markersById: Record<string, maplibregl.Marker>,
  spiderMarkersRef: { current: maplibregl.Marker[] },
  popupRef: { current: maplibregl.Popup | null },
  openPopupChurchIdRef: { current: string | null }
): void {
  spiderMarkersRef.current.forEach((m) => m.remove());
  spiderMarkersRef.current = [];

  for (const church of churches) {
    const m = markersById[church.id];
    if (m) {
      m.setLngLat([church.lng, church.lat]);
      m.setOffset([0, 0]);
    }
  }

  // Note: MapLibre 512px tile zoom 7 corresponds to Leaflet 256px tile zoom 8
  if (map.getZoom() >= 7) {
    for (const group of getColocatedGroups(churches)) {
      const avgLat = group.reduce((sum, c) => sum + c.lat, 0) / group.length;
      const avgLng = group.reduce((sum, c) => sum + c.lng, 0) / group.length;
      const points = group.map((c) => map.project([c.lng, c.lat]));

      let minPixelDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const d = Math.hypot(dx, dy);
          if (d < minPixelDist) minPixelDist = d;
        }
      }

      if (minPixelDist >= 26) continue;

      const offsetPx = group.length === 2 ? 15 : 18;
      const svgSize = 56;
      const half = svgSize / 2;
      const lineSegments: string[] = [];

      group.forEach((church, i) => {
        const angle =
          group.length === 2
            ? i === 0
              ? Math.PI
              : 0
            : (2 * Math.PI * i) / group.length - Math.PI / 2;
        const dx = Math.cos(angle) * offsetPx;
        const dy = Math.sin(angle) * offsetPx;
        const marker = markersById[church.id];
        if (marker) {
          marker.setLngLat([avgLng, avgLat]);
          marker.setOffset([dx, dy]);
        }

        lineSegments.push(
          `<line x1="${half}" y1="${half}" x2="${(half + dx).toFixed(2)}" y2="${(half + dy).toFixed(2)}" stroke="#00224c" stroke-width="1.5" stroke-opacity="0.45" />`
        );
      });

      const spiderEl = document.createElement('div');
      spiderEl.style.width = `${svgSize}px`;
      spiderEl.style.height = `${svgSize}px`;
      spiderEl.style.pointerEvents = 'none';
      spiderEl.style.zIndex = '5';
      spiderEl.innerHTML = `
        <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" aria-hidden="true">
          ${lineSegments.join('')}
          <circle cx="${half}" cy="${half}" r="3" fill="#c59b43" stroke="#00224c" stroke-width="1" fill-opacity="0.95" />
        </svg>
      `;

      const spiderMarker = new maplibregl.Marker({
        element: spiderEl,
        anchor: 'center',
      })
        .setLngLat([avgLng, avgLat])
        .addTo(map);

      spiderMarkersRef.current.push(spiderMarker);
    }
  }

  const activePopupId = openPopupChurchIdRef.current;
  if (activePopupId && popupRef.current?.isOpen() && markersById[activePopupId]) {
    const activeMarker = markersById[activePopupId];
    const off = activeMarker.getOffset();
    popupRef.current
      .setLngLat(activeMarker.getLngLat())
      .setOffset([off.x, off.y - 16]);
  }
}

export function AustraliaChurchMap({
  churches,
  selectedChurchId,
  selectionNonce = 0,
  onSelectChurch,
  totalChurchCount,
  className = 'h-[400px] lg:h-[640px]',
}: AustraliaChurchMapProps) {
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const openPopupChurchIdRef = useRef<string | null>(null);
  const markersByIdRef = useRef<Record<string, maplibregl.Marker>>({});
  const spiderMarkersRef = useRef<maplibregl.Marker[]>([]);
  const churchesRef = useRef<ChurchRecord[]>(churches);
  churchesRef.current = churches;
  const selectedChurchIdRef = useRef<string | null>(selectedChurchId);
  selectedChurchIdRef.current = selectedChurchId;
  const onSelectRef = useRef(onSelectChurch);
  onSelectRef.current = onSelectChurch;

  function openPopupForChurch(churchId: string) {
    const map = mapRef.current;
    const popup = popupRef.current;
    const marker = markersByIdRef.current[churchId];
    const church = churchesRef.current.find((c) => c.id === churchId);
    if (!map || !popup || !marker || !church) return;

    openPopupChurchIdRef.current = churchId;
    const off = marker.getOffset();
    popup
      .setLngLat(marker.getLngLat())
      .setOffset([off.x, off.y - 16])
      .setHTML(buildPopupHtml(church))
      .addTo(map);
  }

  // Initialize MapLibre GL map once; fall back to Leaflet raster map if blocked
  useEffect(() => {
    if (useLeafletFallback || !containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: OPENFREEMAP_STYLE_URL,
        center: AUSTRALIA_CENTER,
        zoom: AUSTRALIA_DEFAULT_ZOOM,
        minZoom: AUSTRALIA_MIN_ZOOM,
        maxBounds: AUSTRALIA_MAX_BOUNDS,
        scrollZoom: true,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      });
    } catch {
      setUseLeafletFallback(true);
      return;
    }

    let hasLoaded = false;
    const triggerFallback = () => {
      setUseLeafletFallback(true);
    };

    const loadTimeoutId = window.setTimeout(() => {
      if (!hasLoaded) {
        triggerFallback();
      }
    }, 5000);

    const handleLoad = () => {
      hasLoaded = true;
      window.clearTimeout(loadTimeoutId);
    };

    const handleError = (event: { error?: { name?: string; message?: string }; sourceId?: string }) => {
      const errName = event?.error?.name ?? '';
      const errMsg = event?.error?.message ?? '';
      if (errName === 'AbortError' || /abort/i.test(errMsg)) {
        return;
      }
      // If style, worker, or OpenFreeMap tiles are blocked (e.g. Brave Shields / uBlock Origin),
      // switch to the Leaflet + OpenStreetMap raster fallback.
      if (!hasLoaded || event?.sourceId) {
        triggerFallback();
      }
    };

    map.on('load', handleLoad);
    map.on('error', handleError);

    // Keep attribution collapsed behind the (i) button by default
    const attribEl = containerRef.current.querySelector('.maplibregl-ctrl-attrib');
    if (attribEl) {
      attribEl.setAttribute('open', '');
      attribEl.classList.add('maplibregl-compact');
      attribEl.classList.remove('maplibregl-compact-show');
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const popup = new maplibregl.Popup({
      offset: 16,
      maxWidth: '295px',
      closeButton: true,
      closeOnClick: true,
      className: 'crca-maplibre-popup',
    });
    popup.on('close', () => {
      openPopupChurchIdRef.current = null;
    });

    mapRef.current = map;
    popupRef.current = popup;

    const handleZoomEnd = () => {
      layoutColocatedMarkers(
        map,
        churchesRef.current,
        markersByIdRef.current,
        spiderMarkersRef,
        popupRef,
        openPopupChurchIdRef
      );
    };
    map.on('zoomend', handleZoomEnd);

    return () => {
      window.clearTimeout(loadTimeoutId);
      map.off('load', handleLoad);
      map.off('error', handleError);
      map.off('zoomend', handleZoomEnd);
      spiderMarkersRef.current.forEach((m) => m.remove());
      spiderMarkersRef.current = [];
      Object.values(markersByIdRef.current).forEach((m) => m.remove());
      markersByIdRef.current = {};
      popup.remove();
      popupRef.current = null;
      openPopupChurchIdRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [useLeafletFallback]);

  // Re-render markers and fit bounds whenever filtered churches change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    spiderMarkersRef.current.forEach((m) => m.remove());
    spiderMarkersRef.current = [];
    Object.values(markersByIdRef.current).forEach((m) => m.remove());
    markersByIdRef.current = {};

    const coords: [number, number][] = [];
    churches.forEach((church) => {
      const el = createPinElement(church, church.id === selectedChurchIdRef.current);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectRef.current(church.id);
        openPopupForChurch(church.id);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([church.lng, church.lat])
        .addTo(map);

      markersByIdRef.current[church.id] = marker;
      coords.push([church.lng, church.lat]);
    });

    if (coords.length === 0) {
      popupRef.current?.remove();
      openPopupChurchIdRef.current = null;
      return;
    }

    if (churches.length === totalChurchCount) {
      map.jumpTo({ center: AUSTRALIA_CENTER, zoom: AUSTRALIA_DEFAULT_ZOOM });
    } else if (coords.length === 1) {
      map.jumpTo({ center: coords[0], zoom: 12 });
    } else {
      const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
      for (const coord of coords) {
        bounds.extend(coord);
      }
      map.fitBounds(bounds, { padding: 48, maxZoom: 11.5, duration: 0 });
    }

    layoutColocatedMarkers(
      map,
      churches,
      markersByIdRef.current,
      spiderMarkersRef,
      popupRef,
      openPopupChurchIdRef
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churches, totalChurchCount]);

  // Update active marker icon + fly/open popup when selectedChurchId or selectionNonce changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.entries(markersByIdRef.current).forEach(([id, marker]) => {
      const isSelected = id === selectedChurchId;
      applyPinStyling(marker.getElement(), isSelected);
    });

    if (!selectedChurchId) {
      popupRef.current?.remove();
      openPopupChurchIdRef.current = null;
      return;
    }

    const marker = markersByIdRef.current[selectedChurchId];
    if (!marker) return;

    const selectedChurch = churchesRef.current.find((c) => c.id === selectedChurchId);
    const targetCenter: [number, number] = selectedChurch
      ? [selectedChurch.lng, selectedChurch.lat]
      : [marker.getLngLat().lng, marker.getLngLat().lat];

    // MapLibre 512px zoom 10.2 corresponds to Leaflet 256px zoom ~11
    const targetZoom = Math.max(map.getZoom(), 10.2);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const currentCenter = map.getCenter();
    const distMeters =
      distanceKm(currentCenter.lat, currentCenter.lng, targetCenter[1], targetCenter[0]) * 1000;

    if (prefersReducedMotion) {
      map.jumpTo({ center: targetCenter, zoom: targetZoom });
      layoutColocatedMarkers(
        map,
        churchesRef.current,
        markersByIdRef.current,
        spiderMarkersRef,
        popupRef,
        openPopupChurchIdRef
      );
      openPopupForChurch(selectedChurchId);
    } else if (map.getZoom() >= targetZoom && distMeters < 250) {
      map.easeTo({ center: targetCenter, duration: 250 });
      openPopupForChurch(selectedChurchId);
    } else {
      const handleMoveEnd = () => {
        layoutColocatedMarkers(
          map,
          churchesRef.current,
          markersByIdRef.current,
          spiderMarkersRef,
          popupRef,
          openPopupChurchIdRef
        );
        if (selectedChurchIdRef.current === selectedChurchId) {
          openPopupForChurch(selectedChurchId);
        }
      };
      map.once('moveend', handleMoveEnd);
      map.flyTo({ center: targetCenter, zoom: targetZoom, duration: 480, essential: true });
      return () => {
        map.off('moveend', handleMoveEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurchId, selectionNonce]);

  if (useLeafletFallback) {
    return (
      <Suspense
        fallback={
          <div
            className={`relative z-0 flex items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm ${className}`}
          >
            <span className="text-sm font-medium text-stone-500">Loading map…</span>
          </div>
        }
      >
        <AustraliaChurchMapLeaflet
          churches={churches}
          selectedChurchId={selectedChurchId}
          selectionNonce={selectionNonce}
          onSelectChurch={onSelectChurch}
          totalChurchCount={totalChurchCount}
          className={className}
        />
      </Suspense>
    );
  }

  return (
    <div
      className={`relative z-0 isolate overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm ${className}`}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Interactive map of Christian Reformed Churches of Australia congregations"
      />
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden sm:block rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-medium text-navy-900 shadow-xs border border-stone-200">
        Select a pin to view service times and church details
      </div>
    </div>
  );
}
