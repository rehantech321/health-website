import { ImageResponse } from 'next/og';
import { Mark, VOID, PARCHMENT, PARCHMENT_SOFT, GOLD, GOLD_DEEP, fonts } from './brand/og';

// Social preview (WhatsApp, iMessage, LinkedIn, Slack, X). Generated at build
// time; Next adds the og:image tags from this file. 1200x630 is the size
// every platform accepts.
export const runtime = 'edge';
export const alt = 'Eldava Health - specialist health assessments online. Answers in days, not years.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: VOID, color: PARCHMENT, padding: '64px 72px', fontFamily: 'Work Sans' }}>
        {/* faint gold rule at the top, like the site's header line */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 6, background: GOLD_DEEP }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Mark size={112} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Fraunces', fontSize: 64, lineHeight: 1, letterSpacing: -1 }}>Eldava Health</div>
            <div style={{ fontSize: 22, color: GOLD, letterSpacing: 4, marginTop: 12, textTransform: 'uppercase' }}>Specialist assessments online</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontFamily: 'Fraunces', fontSize: 58, lineHeight: 1.1, maxWidth: 1000 }}>Get answers in days, not years.</div>
          <div style={{ fontSize: 28, color: PARCHMENT_SOFT, lineHeight: 1.35, maxWidth: 1000 }}>
            ADHD and autism, women&apos;s health, dementia and memory, men&apos;s health, medico-legal. Licensed clinicians, live video, pay in full or in 3.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, color: PARCHMENT_SOFT }}>
          <div>eldava.com</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: GOLD }} />
            <div>60+ specialties · 20 countries</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() }
  );
}
