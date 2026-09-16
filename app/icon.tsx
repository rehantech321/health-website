import { ImageResponse } from 'next/og';
import { Mark, VOID } from './brand/og';

// Site icon (favicon): the brand mark on the site's dark ground. Next serves
// this at /icon and adds the <link rel="icon"> tag; the same file is what
// messaging apps fall back to for the small square in a link preview.
export const runtime = 'edge';
export const size = { width: 256, height: 256 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: VOID, borderRadius: 56 }}>
        <Mark size={200} />
      </div>
    ),
    size
  );
}
