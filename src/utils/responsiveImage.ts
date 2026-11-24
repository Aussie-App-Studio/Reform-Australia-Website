import variants from '../data/imageVariants.json';

// Photos wider than 900px have a phone-sized copy, <name>-800w.webp (made by `npm run images`).
const BASE = import.meta.env.BASE_URL;
const strip = (src: string) => '/' + (src.startsWith(BASE) ? src.slice(BASE.length) : src.replace(/^\//, ''));
const HAS_COPY = new Set((variants as string[]).map(strip));

/**
 * srcSet/sizes for an <img>, so phones get the small copy: spread into the tag,
 * e.g. <img src={src} {...responsive(src, '100vw')} />. `sizes` is how wide the image shows.
 */
export function responsive(src: string | undefined, sizes: string): { srcSet?: string; sizes?: string } {
  if (!src || !HAS_COPY.has(strip(src))) return {};
  const small = src.replace(/\.(webp|jpe?g|png)$/i, '-800w.webp');
  return { srcSet: `${small} 800w, ${src} 1600w`, sizes };
}
