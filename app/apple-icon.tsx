import { ImageResponse } from 'next/og';
import { Mark, VOID } from './brand/og';

// iOS home-screen / Safari icon. Apple applies its own corner mask, so this
// is a full-bleed square.
export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: VOID }}>
        <Mark size={136} />
      </div>
    ),
    size
  );
}
