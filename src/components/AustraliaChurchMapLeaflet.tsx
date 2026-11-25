import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AustraliaChurchMapProps,
  buildPopupHtml,
  ChurchRecord,
  getColocatedGroups,
} from './churchMapShared';

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

/**
 * Raster-tile Leaflet fallback used when MapLibre GL / OpenFreeMap is blocked
 * (e.g. by privacy shields or content blockers) or WebGL is unavailable.
 */
export function AustraliaChurchMapLeaflet({
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
  const selectedChurchIdRef = useRef<string | null>(selectedChurchId);
  selectedChurchIdRef.current = selectedChurchId;
  const onSelectRef = useRef(onSelectChurch);
  onSelectRef.current = onSelectChurch;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-28.2, 133.8],
      zoom: 4,
      minZoom: 3,
      scrollWheelZoom: true,
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
        icon: createPinIcon(church.id === selectedChurchIdRef.current),
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
