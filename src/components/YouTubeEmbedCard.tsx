import { useState } from 'react';
import { Play } from 'lucide-react';

interface YouTubeEmbedCardProps {
  youtubeId: string;
  title: string;
  subtitle?: string;
}

/**
 * Lightweight click-to-play YouTube embed that defers loading iframe assets
 * until the visitor selects play.
 */
export function YouTubeEmbedCard({ youtubeId, title, subtitle }: YouTubeEmbedCardProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="relative aspect-video bg-navy-950">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group relative block h-full w-full cursor-pointer text-left"
          >
            <img
              src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent"
            />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl ring-4 ring-white/25 transition-transform group-hover:scale-105 group-hover:bg-teal-500">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-base font-bold text-navy-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-stone-600">{subtitle}</p>}
      </div>
    </div>
  );
}
