import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface ChurchRecord {
  id: string;
  name: string;
  suburb: string;
  state: 'NSW' | 'ACT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA';
  postcode: string;
  classis: string;
  address: string;
  lat: number;
  lng: number;
  serviceTimes: string | null;
  website: string | null;
  facebook: string | null;
  youtube: string | null;
  videoUrl: string | null;
  livestreamOnFacebook: boolean;
  podcast: string | null;
}

interface AustraliaChurchMapProps {
  churches: ChurchRecord[];
  selectedChurchId: string | null;
  selectionNonce?: number;
  onSelectChurch: (id: string) => void;
  totalChurchCount: number;
  className?: string;
}

export function getDirectionsUrl(church: Pick<ChurchRecord, 'lat' | 'lng'>): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${church.lat},${church.lng}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createPinIcon(isSelected: boolean): L.DivIcon {
  if (isSelected) {
    return L.divIcon({
      className: 'crca-map-pin-selected',
      html: `<div style="width:24px;height:24px;border-radius:9999px;background:#00224c;border:3px solid #ffffff;box-shadow:0 0 0 4px rgba(197,155,67,0.55),0 4px 10px rgba(0,34,76,0.4);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14],
    });
  }

  return L.divIcon({
    className: 'crca-map-pin',
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:#00a6ca;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,34,76,0.35);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

function buildPopupHtml(church: ChurchRecord): string {
  const safeName = escapeHtml(church.name);
  const safeAddress = escapeHtml(church.address);
  const safeService = church.serviceTimes ? escapeHtml(church.serviceTimes) : null;
  const directionsUrl = getDirectionsUrl(church);

  const links: string[] = [];
  const pillStyle =
    'display:inline-block;padding:4px 9px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;';

  if (church.website) {
    links.push(
      `<a href="${escapeHtml(church.website)}" target="_blank" rel="noopener noreferrer" style="${pillStyle}background:#00224c;color:#ffffff;">Website</a>`
    );
  }
  if (church.youtube) {
    links.push(
      `<a href="${escapeHtml(church.youtube)}" target="_blank" rel="noopener noreferrer" style="${pillStyle}background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;">YouTube</a>`
    );
  } else if (church.videoUrl) {
    links.push(
      `<a href="${escapeHtml(church.videoUrl)}" target="_blank" rel="noopener noreferrer" style="${pillStyle}background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;">Livestream</a>`
    );
  }
  if (church.facebook) {
    const fbLabel = church.livestreamOnFacebook ? 'Facebook Livestream' : 'Facebook';
    links.push(
      `<a href="${escapeHtml(church.facebook)}" target="_blank" rel="noopener noreferrer" style="${pillStyle}background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;">${fbLabel}</a>`
    );
  }
  if (church.podcast) {
    links.push(
      `<a href="${escapeHtml(church.podcast)}" target="_blank" rel="noopener noreferrer" style="${pillStyle}background:#e6f7fb;color:#036982;border:1px solid #cff0f8;">Podcast</a>`
    );
  }

  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:210px;max-width:270px;color:#00224c;">
      <div style="font-family:Lora,Georgia,serif;font-weight:700;font-size:15px;line-height:1.25;">${safeName}</div>
      <div style="margin-top:4px;font-size:12px;color:#423d37;line-height:1.4;">${safeAddress} <a href="${escapeHtml(directionsUrl)}" target="_blank" rel="noopener noreferrer" style="margin-left:4px;font-weight:600;color:#036982;text-decoration:underline;">Directions</a></div>
      ${
        safeService
          ? `<div style="margin-top:6px;font-size:12px;font-weight:600;color:#036982;">Sundays: ${safeService}</div>`
          : ''
      }
      ${
        links.length > 0
          ? `<div style="margin-top:9px;display:flex;flex-wrap:wrap;gap:5px;">${links.join('')}</div>`
          : ''
      }
    </div>
  `;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getColocatedGroups(churches: ChurchRecord[], thresholdKm = 0.5): ChurchRecord[][] {
  const sorted = [...churches].sort((a, b) => a.id.localeCompare(b.id));
  const visited = new Set<string>();
  const groups: ChurchRecord[][] = [];

  for (const seed of sorted) {
    if (visited.has(seed.id)) continue;
    const group: ChurchRecord[] = [seed];
    visited.add(seed.id);

    for (let i = 0; i < group.length; i++) {
      const curr = group[i];
      for (const candidate of sorted) {
        if (visited.has(candidate.id)) continue;
        if (distanceKm(curr.lat, curr.lng, candidate.lat, candidate.lng) <= thresholdKm) {
          visited.add(candidate.id);
          group.push(candidate);
        }
      }
    }

    if (group.length >= 2) {
      groups.push(group);
    }
  }

  return groups;
}

/**
 * Separates co-located markers (e.g. two congregations sharing one property)
 * once zoomed in so both pins remain visible and independently clickable.
 */
function layoutColocatedMarkers(
  map: L.Map,
  churches: ChurchRecord[],
  markersById: Record<string, L.Marker>,
  spiderGroup: L.LayerGroup
): void {
  spiderGroup.clearLayers();

  for (const church of churches) {
    markersById[church.id]?.setLatLng([church.lat, church.lng]);
  }

  if (map.getZoom() < 8) return;

  for (const group of getColocatedGroups(churches)) {
    const avgLat = group.reduce((sum, c) => sum + c.lat, 0) / group.length;
    const avgLng = group.reduce((sum, c) => sum + c.lng, 0) / group.length;
    const points = group.map((c) => map.latLngToLayerPoint([c.lat, c.lng]));

    let minPixelDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = points[i].distanceTo(points[j]);
        if (d < minPixelDist) minPixelDist = d;
      }
    }

    if (minPixelDist >= 26) continue;

    const centerPt = map.latLngToLayerPoint([avgLat, avgLng]);
    const offsetPx = group.length === 2 ? 15 : 18;

    group.forEach((church, i) => {
      const angle =
        group.length === 2
          ? i === 0
            ? Math.PI
            : 0
          : (2 * Math.PI * i) / group.length - Math.PI / 2;
      const offsetPt = L.point(
        centerPt.x + Math.cos(angle) * offsetPx,
        centerPt.y + Math.sin(angle) * offsetPx
      );
      const displayLatLng = map.layerPointToLatLng(offsetPt);
      markersById[church.id]?.setLatLng(displayLatLng);

      L.polyline([[avgLat, avgLng], displayLatLng], {
        color: '#00224c',
        weight: 1.5,
        opacity: 0.45,
        interactive: false,
      }).addTo(spiderGroup);
    });

    L.circleMarker([avgLat, avgLng], {
      radius: 3,
      color: '#00224c',
      fillColor: '#c59b43',
      fillOpacity: 0.9,
      weight: 1,
      interactive: false,
    }).addTo(spiderGroup);
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const spiderGroupRef = useRef<L.LayerGroup | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Record<string, L.Marker>>({});
  const churchesRef = useRef<ChurchRecord[]>(churches);
  churchesRef.current = churches;
  const onSelectRef = useRef(onSelectChurch);
  onSelectRef.current = onSelectChurch;

  // Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-28.2, 133.8],
      zoom: 4,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const spiderGroup = L.layerGroup().addTo(map);
    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    spiderGroupRef.current = spiderGroup;
    layerGroupRef.current = group;

    const handleZoomEnd = () => {
      if (spiderGroupRef.current) {
        layoutColocatedMarkers(
          map,
          churchesRef.current,
          markersByIdRef.current,
          spiderGroupRef.current
        );
      }
    };
    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
      map.remove();
      mapRef.current = null;
      spiderGroupRef.current = null;
      layerGroupRef.current = null;
      markersByIdRef.current = {};
    };
  }, []);

  // Re-render markers and fit bounds whenever filtered churches change
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    const spiderGroup = spiderGroupRef.current;
    if (!map || !group || !spiderGroup) return;

    spiderGroup.clearLayers();
    group.clearLayers();
    markersByIdRef.current = {};

    const coords: [number, number][] = [];
    churches.forEach((church) => {
      const marker = L.marker([church.lat, church.lng], {
        icon: createPinIcon(church.id === selectedChurchId),
        title: church.name,
      });

      marker.bindPopup(buildPopupHtml(church), { maxWidth: 290 });
      marker.on('click', () => {
        onSelectRef.current(church.id);
      });

      marker.addTo(group);
      markersByIdRef.current[church.id] = marker;
      coords.push([church.lat, church.lng]);
    });

    if (coords.length === 0) return;

    if (churches.length === totalChurchCount) {
      map.setView([-28.2, 133.8], 4);
    } else if (coords.length === 1) {
      map.setView(coords[0], 13);
    } else {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [44, 44], maxZoom: 12 });
    }

    layoutColocatedMarkers(map, churches, markersByIdRef.current, spiderGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churches, totalChurchCount]);

  // Update active marker icon + fly/open popup when selectedChurchId or selectionNonce changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.entries(markersByIdRef.current).forEach(([id, marker]) => {
      const isSelected = id === selectedChurchId;
      marker.setIcon(createPinIcon(isSelected));
      marker.setZIndexOffset(isSelected ? 500 : 0);
    });

    if (!selectedChurchId) {
      map.closePopup();
      return;
    }

    const marker = markersByIdRef.current[selectedChurchId];
    if (!marker) return;

    const selectedChurch = churchesRef.current.find((c) => c.id === selectedChurchId);
    const latLng = selectedChurch
      ? L.latLng(selectedChurch.lat, selectedChurch.lng)
      : marker.getLatLng();
    const targetZoom = Math.max(map.getZoom(), 11);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      map.setView(latLng, targetZoom, { animate: false });
      marker.openPopup();
    } else if (map.getZoom() >= targetZoom && map.getCenter().distanceTo(latLng) < 250) {
      map.panTo(latLng, { animate: true, duration: 0.25 });
      marker.openPopup();
    } else {
      const openSelectedPopup = () => {
        if (markersByIdRef.current[selectedChurchId] === marker) {
          marker.openPopup();
        }
      };
      map.once('moveend', openSelectedPopup);
      map.flyTo(latLng, targetZoom, { duration: 0.45 });
      return () => {
        map.off('moveend', openSelectedPopup);
      };
    }
  }, [selectedChurchId, selectionNonce]);

  return (
    <div
      className={`relative z-0 isolate overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm ${className}`}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Interactive map of Christian Reformed Churches of Australia congregations"
      />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[450] hidden sm:block rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-medium text-navy-900 shadow-xs border border-stone-200">
        Select a pin to view service times and church details
      </div>
    </div>
  );
}
