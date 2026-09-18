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

**Admin panel** at `/admin` - the practice's own back office (see below).

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

Admin sign-in after seeding: `/admin`, `admin@eldava.com` /
`eldava-admin-2026`. Override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
when running the seed; the password is only set when the account is first
created, so re-seeding never resets it. **Change it before going live.**

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
approves it in the admin panel.

**Admin panel** - `app/admin/*` (UI) and `app/api/admin/*` (API). A third
account type with its own cookie (`eldava_admin`), its own login, and no
overlap with patient or clinician sessions - a patient cookie on an admin
route is a 401, not a downgrade.

- *Doctor applications*: the queue of clinicians who signed up. Until an
  application is approved the applicant cannot sign in to the portal
  (`/api/clinician/login` answers 403 "still under review" / "not approved").
  Approving creates the `Clinician` from the application - same email, the
  password they chose, the display name and service category the admin
  confirms - and emails them. Declining emails them the review notes.
  Approving twice is a 409; the application records who approved it and when.
- *Clinicians*: add directly (for a doctor the practice already knows), edit
  details, bio and password, deactivate (hidden from booking and blocked from
  sign-in, history kept) or reactivate, publish availability (date range x
  hours x weekdays, in one go, skipping any time already published), remove
  free slots. Delete is refused while the clinician has any appointments.
- *Patients*: search, view every booking / voucher / intake (with the AI
  summary and the clinician's note, both logged as reads - see below), edit
  contact details. Delete is refused while paid or completed records exist:
  those are financial and clinical records with retention obligations.
- *Appointments*: every booking across every clinician, filterable by status,
  clinician, date window and search. Cancel with a reason: the slot is released,
  patient and clinician are emailed, and the response flags `refundNeeded` when
  the payment had gone through (refunds are issued in Stripe, not here).
- *Enquiries*, *Founding 500*: triage and close enquiries; see vouchers sold.
- *Audit log*: append-only record of every admin action, and of every time an
  admin opened a record containing clinical content (`patient.view`,
  `appointment.view`). The dashboard's "needs attention" strip counts pending
  applications, new enquiries and upcoming video appointments with no link.

The panel is `noindex` and listed in `robots.txt` as disallowed; the URL is
not a secret, the login is.

## Routing note

`trailingSlash: true` would 308-redirect every `/api/*` call to `/api/*/` -
and Stripe does not follow redirects, so every payment confirmation would be
logged as a failed delivery. `next.config.js` therefore sets
`skipTrailingSlashRedirect`, and `middleware.ts` reapplies the page redirect
(`/pricing` -> `/pricing/`) for everything that is not an API route or a file.

## Layout

```
app/api/            auth, intake, booking, vouchers, payments, patient,
                    clinician, enquiries, applications, promo, admin
app/admin/          admin panel (client components; its own admin.css)
app/<route>/        one page.tsx per marketing route (npm run gen)
app/mock-checkout/  stand-in for Stripe Checkout when no key is set
lib/server/         db, auth, http, services, anthropic, claude/, payments,
                    booking-state, promo, vouchers, mail, holds, admin
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

The admin panel has its own 30-assertion suite: admin 401s and cookie
isolation; doctor applies -> sign-in blocked with the review message ->
admin approves -> clinician created in the chosen category -> doctor signs in
with the password they chose -> second approval 409; availability publishing
and the new doctor appearing in patient slot search; edit / deactivate
(sign-in 403, hidden from search) / reactivate; patient edit; a paid booking
appearing in the admin list, cancel releasing the slot and flagging a refund,
second cancel 409; delete-with-records refused for both clinician and patient;
and the audit trail. Every admin page was rendered in headless Edge.

Payment ran through the mock checkout (no Stripe key) but exercised the real
`confirmPayment` transition, the same code path a Stripe webhook uses. Intake
and summaries ran in mock mode (no Anthropic key); the real path shares all
validation and storage and differs only in what generates the text.

## Before this goes anywhere near real patients

Working software, not a cleared clinical system. Still needed at minimum:
encryption at rest and a retention policy for `IntakeSession` /
`ClinicalNote` (the admin audit log records who read which record, but is
not yet tamper-evident); DPIA and UK GDPR
Article 9 lawful basis; real regulator verification of clinician registration
numbers (the seed asserts them, and approving an application does not check
them); rate limiting and lockout on all three login endpoints, and a second factor
for admin sign-in; real video/phone
infrastructure behind `Appointment.joinUrl`; deletion of the seeded demo
clinicians and their shared password and a new admin password; and clinical sign-off on both prompts in
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

## SEO

- **One section per URL.** `lib/activate-route.ts` serves only the requested
  page's section (plus the account/clinician app screens), not all 27, and
  promotes its hero heading to the page's single `<h1>`. Navigating to another
  section is a normal page load (`Eldava.go` in `eldava-app.js`).
- **Assessment pages** - `/assessments/` and `/assessments/<slug>/`, content
  in `lib/landing-pages.ts`. Each targets one search intent, with unique copy,
  FAQ, price and duration pulled from the service catalogue, and
  `MedicalWebPage` + `FAQPage` + `BreadcrumbList` structured data. To add one,
  add an entry there - the route, sitemap, footer links and price-list links
  follow automatically.
- **Articles** have their own URLs, `/insights/<id>/`, built from `ARTICLES`
  in `eldava-app.js` (`lib/catalogue.ts`), with `Article` structured data.
  Old `/#blog-<id>` links redirect.
- **Structured data** is per page (`lib/seo.ts`); only the organisation and
  website blocks are sitewide.
- **Titles/descriptions** live in `lib/routes.ts` (synced into the titles map
  in `eldava-app.js`).
- **Sitemap, robots, canonicals** use `NEXT_PUBLIC_SITE_URL`, which is read at
  build time - set it before `deploy.sh`, and change it when moving to eldava.com.
