import { Link } from 'react-router-dom';
import dotsData from '../data/australiaDots.json';
import type { ChurchRecord } from './AustraliaChurchMap';

interface Props {
  churches: ChurchRecord[];
  className?: string;
  /** Colour of the land dots (CSS colour). */
  landColor?: string;
  /** Colour of the church markers (CSS colour). */
  churchColor?: string;
}

/**
 * A light-weight dot map of Australia with one marker per congregation.
 * Land dots are pre-computed from Natural Earth outlines (src/data/australiaDots.json);
 * church positions come straight from churches.json, so the map always matches the directory.
 */
export function AustraliaDotMap({ churches, className = '', landColor = 'rgba(255,255,255,0.16)', churchColor = '#29bee0' }: Props) {
  const { proj, width, height, dots, step } = dotsData;
  const project = (lat: number, lng: number) => [(lng - proj.lon0) * proj.k, proj.lat1 - lat] as const;
  const r = step * 0.22;

  return (
    <svg
      viewBox={`-0.5 -0.5 ${width + 1} ${height + 1}`}
      className={className}
      role="img"
      aria-label={`Map of Australia showing ${churches.length} CRCA congregations`}
    >
      <g fill={landColor}>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g>
        {churches.map((c) => {
          const [x, y] = project(c.lat, c.lng);
          return (
            <Link key={c.id} to={`/find-a-church?q=${encodeURIComponent(c.name)}`} aria-label={c.name}>
              <circle cx={x} cy={y} r={r * 3.2} fill={churchColor} opacity={0.22} />
              <circle cx={x} cy={y} r={r * 1.6} fill={churchColor}>
                <title>{`${c.name}, ${c.suburb ?? ''} ${c.state}`.replace(/\s+/g, ' ')}</title>
              </circle>
            </Link>
          );
        })}
      </g>
    </svg>
  );
}
