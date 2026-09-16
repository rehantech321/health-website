import OpenGraphImage from './opengraph-image';

// X / Twitter reads twitter:image rather than og:image; same picture. Route
// segment config must be declared here literally - Next reads it statically
// and does not follow re-exports.
export const runtime = 'edge';
export const alt = 'Eldava Health - specialist health assessments online. Answers in days, not years.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return OpenGraphImage();
}
