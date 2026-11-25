// Church data types and helpers that don't need the map library.
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

export function getDirectionsUrl(church: Pick<ChurchRecord, 'lat' | 'lng'>): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${church.lat},${church.lng}`;
}
