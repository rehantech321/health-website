# Eldava Health

Next.js (App Router, TypeScript) site with a complete backend behind the
original marketing UI. The front end is the design from `index.html`, carried
over as one HTML string (`lib/shared-body.ts`) plus the original CSS
(`app/globals.css`) and app script (`public/eldava-app.js`), now wired to real
API routes under `app/api/` and a Postgres database.

## What the backend covers

**The patient journey**

1. Patient registers an account
2. An AI assistant asks a structured set of intake / triage questions (Claude)
3. Patient books a real appointment slot with a doctor
4. Patient pays in full by card, or "Pay later" via Klarna
5. The doctor signs into a secure portal and reads an AI-generated summary of the
   patient's answers before the call
6. The doctor holds the appointment, then records their own clinical notes

**Everything else on the site that used to pretend to submit somewhere**

- Enquiry forms (employers, schools, universities, insurers, health systems,
  legal, pathway, testimonials, pharmacists, technical roles, general contact)
- Clinician applications to join the network
- Promo-code claims (lead capture) and server-side discount validation
- Founding 500 prepaid vouchers, with a live counter and a server-enforced cap
- Patient profile: details, every booking, every voucher

## Setup

```bash
npm install
# put DATABASE_URL in .env  (see below - NOT .env.local)
cp .env.example .env.local        # optional API keys
npm run db:push                   # create / extend the tables
npm run db:seed                   # 13 demo clinicians, 4 weeks of slots, ELDAVA15
npm run dev                       # http://localhost:3000
```

### Environment

**`DATABASE_URL` goes in `.env`, not `.env.local`.** The Prisma CLI only
auto-loads `.env`; `db:push` and `db:seed` fail with "Environment variable not
found" if it is only in `.env.local`. Next.js reads both.

If you use Supabase, use the **Session pooler** connection string (port 5432).
The direct host `db.<ref>.supabase.co` resolves to IPv6 only and is unreachable
from an IPv4-only network, which surfaces as Prisma `P1001`.

Every other key is optional. Without it, that feature runs in a clearly
labelled mock mode rather than failing:

| Key | Without it |
| --- | --- |
| `ANTHROPIC_API_KEY` | Intake uses a fixed, conservative question set; the clinician summary is built from verbatim answers only. Both are labelled as not AI-generated in the UI and in the stored record (`model = "mock-no-api-key"`). |
| `STRIPE_SECRET_KEY` | Checkout goes to `/mock-checkout`, a local page that stands in for Stripe's hosted page. No money moves. |
| `STRIPE_WEBHOOK_SECRET` | Needed alongside the secret key for real payments to be confirmed. |
| `RESEND_API_KEY` | Enquiries, applications and confirmations are stored and logged to the console instead of emailed. |

Demo clinician sign-in after seeding: any address in `prisma/seed.js`
(e.g. `amara.osei@eldava.com`), password `eldava-demo-2026`.

## How it works

**Auth** - `lib/server/auth.ts`, `app/api/auth/*`, `app/api/clinician/login`.
scrypt-hashed passwords with per-password salts. Sessions are opaque tokens
stored hashed in `Session` and set as httpOnly, SameSite=Lax cookies; the
cookie, not client state, authorises every request. Patients and clinicians use
separate cookies so one browser can hold both.

**AI intake** - `lib/server/claude/intake.ts`, `app/api/intake/*`. Claude
generates 6-9 triage questions tailored to the service and the patient's own
words, as validated structured output (`messages.parse` + Zod), then one round
of follow-ups. The prompt forbids diagnosing, recommending treatment, or telling
the patient what their answers mean. Safety is not left to the model:
`detectRedFlag()` runs deterministic checks over the patient's words and can
only ever *escalate*. A disclosure stops the questionnaire and shows crisis
signposting.

**Booking** - `app/api/booking/*`. Real per-clinician slots, matched to a
service by category. Double-booking is prevented by a unique constraint on
`Appointment.slotId` - verified under a five-way concurrent race: exactly one
wins, the rest get 409. A slot is held from the moment a booking is created,
before payment; that hold **expires after 30 minutes** (Stripe Checkout's own
session lifetime) unless a payment is in flight, at which point the appointment
becomes `EXPIRED` and its `slotId` is cleared so the time is released for
everyone. `lib/server/holds.ts` does this at the start of every slot lookup and
booking attempt - no background job needed. A patient returning to a time they
already hold is handed their existing booking to finish paying (`resumed:
true`) rather than told their own hold is taken; re-booking a time they have
already paid for gets a 409 pointing at My profile. Prices come from
`lib/server/services.ts` (generated from the UI's own list by
`scripts/generate-services.js`) and the `PromoCode` table - never from the
request body.

**Payments** - `lib/server/payments.ts`, `app/api/payments/*`. Card and Klarna
both go through Stripe Checkout, so card numbers never touch this server and
Klarna's redirect flow is handled by the same integration. A purchase stays
pending until Stripe's **webhook** confirms it; the browser's return URL is
never trusted as proof. Replayed webhook events are made idempotent by
`WebhookEvent`. Klarna sets its own instalment plan, so the UI shows the total
and defers the split to Klarna.

**Founding 500 vouchers** - `app/api/vouchers/*`. Prepaid, redeemable after
launch, so no slot is chosen at purchase. The public counter comes from the
database; the 500 cap is enforced at purchase time, counting paid vouchers plus
those still inside the checkout window.

**Clinician portal** - `app/api/clinician/*`. A clinician sees only their own
appointments; "not found" and "not yours" both return 404. The AI summary is
generated once when intake completes and cached in `IntakeSummary`, so opening
a case is a read, not a model call. The portal shows the summary, every verbatim
answer, and which model wrote it.

**Clinician profile & meeting links** - `app/api/clinician/me`,
`app/api/clinician/appointment/[id]`. The portal's *My profile* tab shows the
clinician's verified details (read-only - name, specialty and registration are
what credentialing checked, so changing them is an admin action), lets them
edit the bio patients see when choosing a time, and change their password
(which signs out their other devices). On each **video** appointment the
clinician pastes the meeting link for whatever platform they use; it must be
`https://`, only the owning clinician can set it, and the patient is emailed
the moment it is saved. Phone appointments take no link - the portal shows the
patient's number to call instead. No placeholder link is ever generated.

**Clinical notes** - `app/api/clinician/notes`. SOAP-structured, stored
separately from the AI summary because they are the clinical record and it is
not. Signing is one-way and closes the appointment out.

**Patient profile** - `app/api/patient/appointments`. Returns bookings and
vouchers but deliberately **not** the AI summary or the doctor's notes: a
patient reading a risk assessment of themselves out of context is a clinical
harm, not a feature.

**Enquiries & applications** - `app/api/enquiries`, `app/api/applications`.
Stored first, then emailed to the routed team inbox (routing lives server-side
so the browser cannot redirect an enquiry). Applications are held for
credentialing review; nothing creates a clinician account until a human
approves it.

## Routing note

`trailingSlash: true` would 308-redirect every `/api/*` call to `/api/*/` -
and Stripe does not follow redirects, so every payment confirmation would be
logged as a failed delivery. `next.config.js` therefore sets
`skipTrailingSlashRedirect`, and `middleware.ts` reapplies the page redirect
(`/pricing` -> `/pricing/`) for everything that is not an API route or a file.

## Layout

```
app/api/            auth, intake, booking, vouchers, payments, patient,
                    clinician, enquiries, applications, promo
app/<route>/        one page.tsx per marketing route (npm run gen)
app/mock-checkout/  stand-in for Stripe Checkout when no key is set
lib/server/         db, auth, http, services, anthropic, claude/, payments,
                    booking-state, promo, vouchers, mail
lib/shared-body.ts  the page body HTML (editable multi-line template literal)
lib/routes.ts       route table -> metadata, sitemap
public/eldava-app.js  all client logic, wired to the API
prisma/schema.prisma, prisma/seed.js
middleware.ts       trailing-slash redirect for pages only
```

Adding a page still means the same sync as before: `PAGE_PATHS`/`titles`/`descs`
in `eldava-app.js`, `lib/routes.ts`, `scripts/generate-pages.js`, then
`npm run gen`. Changing `SERVICES` in `eldava-app.js` means re-running
`node scripts/generate-services.js`.

## Verification status

Against a live Supabase Postgres, 53 assertions pass end to end, covering:
register/login/session; intake start -> answer -> follow-ups -> complete;
the red-flag safety net overriding a "No" on the safety question; slots for old
and new categories; promo validation and server-side pricing (a client-supplied
price is ignored); the double-booking 409; Klarna mock checkout -> PAID ->
CONFIRMED; voucher purchase incrementing the public counter; the profile
exposing no clinical fields; enquiry routing and fallback; application
de-duplication; clinician login, own-cases-only, cross-clinician 404; note
draft -> sign -> immutable -> appointment COMPLETED; and the 401/400/405 guards.
The client script was confirmed running in a real browser (headless Edge),
rendering the live voucher counter.

Payment ran through the mock checkout (no Stripe key) but exercised the real
`confirmPayment` transition, the same code path a Stripe webhook uses. Intake
and summaries ran in mock mode (no Anthropic key); the real path shares all
validation and storage and differs only in what generates the text.

## Before this goes anywhere near real patients

Working software, not a cleared clinical system. Still needed at minimum:
encryption at rest and a retention policy for `IntakeSession` /
`ClinicalNote`; an audit trail of who read which record; DPIA and UK GDPR
Article 9 lawful basis; real regulator verification of clinician registration
numbers (the seed asserts them, and approving an application does not check
them); rate limiting and lockout on all three login endpoints; real video/phone
infrastructure behind `Appointment.joinUrl`; deletion of the seeded demo
clinicians and their shared password; and clinical sign-off on both prompts in
`lib/server/claude/`.

## Header

Eight top-level items plus brand, country selector, email and two controls do
not fit the 1180px content measure, so `.nav` is a wider 1760px container and
the row steps down in measured tiers rather than wrapping or overflowing (which
put a horizontal scrollbar on the whole page). Measured widths of this exact
header: full row 1706px, without the email 1581px, without the country
selector 1431px, tightened 1204px. Each breakpoint is that figure plus a 45px
scrollbar margin, because media queries see the window width while layout gets
the window minus the scrollbar. Verified at 29 widths from 400 to 2200 with
zero horizontal overflow. The three dropdown toggles are `<button>`s nested in
`.megawrap`, so the nav-item rule must be a descendant selector
(`nav.links .navlink`), not a child one - the child selector is what left them
in default button chrome.
