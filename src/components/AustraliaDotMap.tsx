import { useState } from 'react';
import { Link } from 'react-router-dom';
import dotsData from '../data/australiaDots.json';
import type { ChurchRecord } from '../utils/churchRecord';

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
 * Hovering, focusing or tapping a marker shows the church name straight away.
 */
export function AustraliaDotMap({ churches, className = '', landColor = 'rgba(255,255,255,0.16)', churchColor = '#29bee0' }: Props) {
  const { proj, width, height, dots, step } = dotsData;
  const project = (lat: number, lng: number) => [(lng - proj.lon0) * proj.k, proj.lat1 - lat] as const;
  const r = step * 0.22;
  const [active, setActive] = useState<ChurchRecord | null>(null);
  const vbW = width + 1;
  const vbH = height + 1;

  const pos = active ? project(active.lat, active.lng) : null;

  return (
    <div className={`relative ${className}`} onMouseLeave={() => setActive(null)}>
      <svg viewBox={`-0.5 -0.5 ${vbW} ${vbH}`} className="block w-full" role="img" aria-label={`Map of Australia showing ${churches.length} CRCA congregations`}>
        <g fill={landColor}>
          {dots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
        </g>
        <g>
          {churches.map((c) => {
            const [x, y] = project(c.lat, c.lng);
            const isActive = active?.id === c.id;
            return (
              <Link
                key={c.id}
                to={`/find-a-church?q=${encodeURIComponent(c.name)}`}
                aria-label={`${c.name}, ${c.suburb} ${c.state}`}
                onMouseEnter={() => setActive(c)}
                onFocus={() => setActive(c)}
                onBlur={() => setActive(null)}
                onTouchStart={() => setActive(c)}
              >
                {/* generous invisible hit area so markers are easy to point at */}
                <circle cx={x} cy={y} r={r * 4.5} fill="transparent" />
                <circle cx={x} cy={y} r={r * (isActive ? 4.2 : 3.2)} fill={churchColor} opacity={isActive ? 0.35 : 0.22} />
                <circle cx={x} cy={y} r={r * (isActive ? 2.2 : 1.6)} fill={isActive ? '#ffffff' : churchColor} />
              </Link>
            );
          })}
        </g>
      </svg>

      {active && pos && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-md bg-white px-3 py-2 text-left shadow-lg"
          style={{ left: `${((pos[0] + 0.5) / vbW) * 100}%`, top: `${((pos[1] + 0.5) / vbH) * 100}%` }}
        >
          <span className="block font-semibold leading-tight text-navy-900">{active.name}</span>
          <span className="block text-sm text-stone-600">
            {active.suburb} {active.state}
            {active.serviceTimes ? ` · ${active.serviceTimes}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}
