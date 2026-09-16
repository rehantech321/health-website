// The brand mark and colours as rendered by next/og (satori). Shared by the
// site icon, the Apple touch icon and the social preview image so all three
// are the exact mark the header draws in lib/shared-body.ts.

export const VOID = '#181209';
export const PARCHMENT = '#f7eedd';
export const PARCHMENT_SOFT = '#bcab8f';
export const GOLD = '#e3a83f';
export const GOLD_DEEP = '#a97a2c';

/// The "E in a circle" mark, at any size. `ink` is the line colour.
export function Mark({ size, ink = PARCHMENT, dot = GOLD }: { size: number; ink?: string; dot?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke={ink} strokeWidth="1.6" />
      <path d="M14 11v18M14 11h11M14 20h8.5M14 29h11" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="26.5" cy="12" r="2.1" fill={dot} />
    </svg>
  );
}

/// Font files live next to this module; satori needs the raw TTF bytes.
/// Fetched by URL rather than fs so this also runs on the edge runtime,
/// which is what the image routes use (next/og's Node build cannot load its
/// bundled fallback font from a path containing a space, as on Windows).
export async function fonts() {
  const [fraunces, workSans] = await Promise.all([
    fetch(new URL('./Fraunces-SemiBold.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL('./WorkSans-Medium.ttf', import.meta.url)).then((r) => r.arrayBuffer()),
  ]);
  return [
    { name: 'Fraunces', data: fraunces, weight: 600 as const, style: 'normal' as const },
    { name: 'Work Sans', data: workSans, weight: 500 as const, style: 'normal' as const },
  ];
}
