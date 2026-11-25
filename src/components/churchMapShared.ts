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

export interface AustraliaChurchMapProps {
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

export function buildPopupHtml(church: ChurchRecord): string {
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
    <div style="font-family:Inter,system-ui,sans-serif;min-width:210px;max-width:265px;padding-right:14px;color:#00224c;">
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

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getColocatedGroups(churches: ChurchRecord[], thresholdKm = 0.5): ChurchRecord[][] {
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
