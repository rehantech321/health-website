import type { Appointment, Patient, Clinician, Voucher } from '@prisma/client';
import nodemailer, { type Transporter } from 'nodemailer';
import { formatMinor } from './services';

// Outbound email. Three transports, chosen by which env vars exist:
//   1. SMTP  - SMTP_HOST/SMTP_USER/SMTP_PASS. This is the Namecheap Private
//              Email mailbox (mail.privateemail.com): mail goes out from the
//              real telehealth@eldava.com address, signed by the DKIM/SPF the
//              domain already has, which is what keeps it out of spam.
//   2. Resend - RESEND_API_KEY, if you would rather use an API provider.
//   3. Console - neither set: the message is logged, not sent. Every caller
//              also persists what it needed to, so nothing is lost.

type Transport = 'smtp' | 'resend' | 'console';

export function transport(): Transport {
  // A developer's machine must never email real patients or clinicians: a test
  // booking on localhost would otherwise send a live doctor a fake briefing
  // with a localhost link in it. In development, mail is logged unless
  // explicitly opted in with MAIL_ALLOW_DEV=true.
  if (process.env.NODE_ENV !== 'production' && process.env.MAIL_ALLOW_DEV !== 'true') return 'console';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  if (process.env.RESEND_API_KEY) return 'resend';
  return 'console';
}

export function isLive(): boolean {
  return transport() !== 'console';
}

/// The From address must be the mailbox we authenticate as (or one of its
/// aliases), or the receiving server rejects it as spoofed.
const FROM = () => process.env.MAIL_FROM || process.env.SMTP_USER || 'Eldava Health <care@eldava.com>';

/// Operational notifications (new bookings etc.) go here. Defaults to the
/// sending mailbox, so with Namecheap that is telehealth@eldava.com.
export const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'care@eldava.com';

let smtp: Transporter | null = null;
function smtpTransport(): Transporter {
  if (!smtp) {
    const port = Number(process.env.SMTP_PORT || 465);
    smtp = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 is implicit TLS; 587 upgrades with STARTTLS. Namecheap supports both.
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return smtp;
}

type Mail = { to: string | string[]; subject: string; text: string; replyTo?: string };

/// Returns true if the provider accepted the message, false if it was only
/// logged (no transport) or the provider rejected it.
export async function sendMail(mail: Mail): Promise<boolean> {
  const to = Array.isArray(mail.to) ? mail.to : [mail.to];
  const mode = transport();

  if (mode === 'console') {
    console.log(`[mail:mock] to=${to.join(',')} subject="${mail.subject}"\n${mail.text}\n`);
    return false;
  }

  if (mode === 'smtp') {
    try {
      const info = await smtpTransport().sendMail({
        from: FROM(),
        to,
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
      });
      console.log(`[mail:smtp] sent "${mail.subject}" to ${to.join(',')} (${info.messageId})`);
      return true;
    } catch (error: any) {
      console.error(`[mail] SMTP rejected "${mail.subject}": ${error?.message || error}`);
      return false;
    }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM(),
      to,
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error(`[mail] Resend rejected "${mail.subject}": ${res.status} ${await res.text()}`);
    return false;
  }
  return true;
}

function when(d: Date) {
  return d.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
}

// ----------------------------------------------------------------- templates

export async function sendBookingConfirmation(a: Appointment & { patient: Patient; clinician: Clinician }) {
  return sendMail({
    to: a.patient.email,
    subject: `Your Eldava Health appointment is confirmed - ${a.reference}`,
    text: [
      `Hello ${a.patient.fullName.split(' ')[0]},`,
      '',
      `Your ${a.serviceName} with ${a.clinician.displayName} is booked.`,
      '',
      `When:      ${when(a.startsAt)} (UK time)`,
      `Format:    ${a.mode}, ${a.durationMin} minutes`,
      `Paid:      ${formatMinor(a.priceMinor)}`,
      `Reference: ${a.reference}`,
      a.joinUrl ? `Join link: ${a.joinUrl}` : a.mode === 'video' ? 'Video link: your clinician will add this before the appointment and we will email it to you.' : 'Format:    your clinician will call you on the number on your account.',
      '',
      'Your clinician will have read your intake answers before you meet.',
      'You can see this booking any time under My profile on the site.',
      '',
      'Eldava Health',
    ].join('\n'),
  });
}

/// Operational notice to the practice inbox. Deliberately carries booking
/// facts only - who, what, when, with whom, how much - and none of the intake
/// or summary. The clinical content is for the treating clinician; the admin
/// mailbox does not need it and should not accumulate it.
export async function sendAdminBookingNotice(a: Appointment & { patient: Patient; clinician: Clinician }, siteUrl: string) {
  return sendMail({
    to: ADMIN_EMAIL(),
    replyTo: a.patient.email,
    subject: `New booking ${a.reference}: ${a.serviceName} with ${a.clinician.displayName}`,
    text: [
      'A new appointment has been booked and paid for.',
      '',
      `Reference:  ${a.reference}`,
      `Patient:    ${a.patient.fullName} <${a.patient.email}>${a.patient.phone ? `, ${a.patient.phone}` : ''}`,
      `Service:    ${a.serviceName}`,
      `Clinician:  ${a.clinician.displayName} <${a.clinician.email}>`,
      `When:       ${when(a.startsAt)} (UK time), ${a.durationMin} min, ${a.mode}`,
      `Paid:       ${formatMinor(a.priceMinor)}${a.promoCode ? ` (${a.promoCode} applied, list ${formatMinor(a.listMinor)})` : ''}`,
      `Country:    ${a.patient.country}`,
      '',
      `The clinician has been sent the pre-consultation briefing and the patient their confirmation.`,
      siteUrl ? `Portal: ${siteUrl}/clinician/portal/` : '',
      '',
      'Eldava Health',
    ].join('\n'),
  });
}

/// The clinician's briefing, sent the moment a booking is paid for. Carries
/// the AI summary and every verbatim answer so the doctor can prepare from
/// their inbox; the portal has the same, plus the notes editor.
export async function sendClinicianBriefing(args: {
  appointment: Appointment & { patient: Patient; clinician: Clinician };
  summary: { presentingComplaint: string; historySummary: string; suggestedFocus: unknown; riskFlags: unknown; riskLevel: string; answerDigest: unknown; model: string } | null;
  concern: string | null;
  siteUrl: string;
}) {
  const a = args.appointment;
  const s = args.summary;
  const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => `  - ${x}`).join('\n') : '  (none)');
  const digest = (v: unknown) =>
    Array.isArray(v) ? v.map((d: any) => `  Q: ${d.question}\n  A: ${d.answer}`).join('\n\n') : '  (no structured answers)';
  const urgent = s?.riskLevel === 'urgent';

  return sendMail({
    to: a.clinician.email,
    subject: `${urgent ? '[URGENT] ' : ''}New booking: ${a.patient.fullName} - ${a.serviceName} - ${when(a.startsAt)}`,
    text: [
      `${a.clinician.displayName},`,
      '',
      `A new ${a.mode} appointment has been confirmed with you.`,
      '',
      `Patient:    ${a.patient.fullName}`,
      `Service:    ${a.serviceName}`,
      `When:       ${when(a.startsAt)} (UK time), ${a.durationMin} min`,
      `Reference:  ${a.reference}`,
      `Portal:     ${args.siteUrl}/clinician/portal/`,
      a.mode === 'video' ? 'Action:     add your video link for this appointment in the portal.' : `Action:     you call the patient${a.patient.phone ? ` on ${a.patient.phone}` : ' (no number on file - contact them by email)'}.`,
      '',
      '----------------------------------------------------------------',
      s ? `PRE-CONSULTATION SUMMARY   (risk level: ${s.riskLevel.toUpperCase()})` : 'PRE-CONSULTATION SUMMARY',
      '----------------------------------------------------------------',
      s
        ? [
            '',
            'Presenting complaint',
            `  ${s.presentingComplaint}`,
            '',
            'History',
            `  ${s.historySummary}`,
            '',
            'Suggested areas to explore',
            list(s.suggestedFocus),
            '',
            'Risk flags',
            list(s.riskFlags),
            '',
            s.model === 'mock-no-api-key'
              ? 'Note: no AI model was configured - the above is built from the patient\'s verbatim answers only.'
              : `Written by ${s.model} from the patient's intake answers. A prompt for your own assessment, not a clinical finding.`,
            '',
            "In the patient's own words",
            `  "${args.concern ?? ''}"`,
            '',
            'What the patient answered',
            digest(s.answerDigest),
          ].join('\n')
        : [
            '',
            'This patient booked without completing the guided intake, so there is no summary.',
            args.concern ? `\nIn their own words:\n  "${args.concern}"` : '',
          ].join('\n'),
      '',
      'Eldava Health',
    ].join('\n'),
  });
}

/// Applicant hears the outcome of their clinician application.
export async function sendApplicationDecision(args: { email: string; fullName: string; approved: boolean; notes?: string | null; siteUrl: string }) {
  const first = args.fullName.split(' ')[0];
  return sendMail({
    to: args.email,
    subject: args.approved ? 'Your Eldava Health clinician account is approved' : 'Your Eldava Health application',
    text: args.approved
      ? [
          `Hello ${first},`,
          '',
          'Your application to join the Eldava Health clinician network has been approved and your portal account is now active.',
          '',
          `Sign in:   ${args.siteUrl}/clinician/sign-in/`,
          `Email:     ${args.email}`,
          'Password:  the one you chose when you applied',
          '',
          'Once signed in, add a short bio under My profile - patients see it when choosing an appointment time - and the clinical team will publish your availability.',
          '',
          'Welcome aboard.',
          'Eldava Health',
        ].join('\n')
      : [
          `Hello ${first},`,
          '',
          'Thank you for applying to join the Eldava Health clinician network. After review we are not able to offer you a place at this time.',
          args.notes ? `\n${args.notes}\n` : '',
          'You are welcome to reapply in future. If you believe this decision was made in error, reply to this email.',
          '',
          'Eldava Health',
        ].join('\n'),
  });
}

/// Both parties hear when an appointment is cancelled by the practice.
export async function sendCancellation(a: Appointment & { patient: Patient; clinician: Clinician }, reason: string) {
  const line = `${a.serviceName} on ${when(a.startsAt)} (ref ${a.reference})`;
  const results = await Promise.allSettled([
    sendMail({
      to: a.patient.email,
      subject: `Your appointment has been cancelled - ${a.reference}`,
      text: [
        `Hello ${a.patient.fullName.split(' ')[0]},`,
        '',
        `We are sorry: your ${line} has been cancelled.`,
        reason ? `\nReason: ${reason}` : '',
        '',
        a.status === 'CONFIRMED' ? 'Any payment you made will be refunded to your original payment method.' : '',
        'To rebook, sign in and choose a new time, or reply to this email and we will help.',
        '',
        'Eldava Health',
      ].join('\n'),
    }),
    sendMail({
      to: a.clinician.email,
      subject: `Cancelled: ${a.patient.fullName} - ${a.reference}`,
      text: [`${a.clinician.displayName},`, '', `The ${line} with ${a.patient.fullName} has been cancelled by the practice.`, reason ? `Reason: ${reason}` : '', '', 'The slot has been released.', '', 'Eldava Health'].join('\n'),
    }),
  ]);
  return results.every((r) => r.status === 'fulfilled' && r.value);
}

export async function sendJoinLink(a: Appointment & { patient: Patient; clinicianName: string; changed: boolean }) {
  return sendMail({
    to: a.patient.email,
    subject: `${a.changed ? 'Updated video link' : 'Your video link'} for ${a.reference}`,
    text: [
      `Hello ${a.patient.fullName.split(' ')[0]},`,
      '',
      `${a.clinicianName} has ${a.changed ? 'updated' : 'added'} the video link for your ${a.serviceName}.`,
      '',
      `When:  ${when(a.startsAt)} (UK time)`,
      `Join:  ${a.joinUrl}`,
      '',
      'Open the link a few minutes before your appointment. It is also shown under My profile on the site.',
      '',
      'Eldava Health',
    ].join('\n'),
  });
}

export async function sendVoucherConfirmation(v: Voucher & { patient: Patient }) {
  return sendMail({
    to: v.patient.email,
    subject: `Your Founding 500 voucher - ${v.code}`,
    text: [
      `Hello ${v.patient.fullName.split(' ')[0]},`,
      '',
      `Thank you for being one of the Founding 500.`,
      '',
      `Voucher:  ${v.serviceName}`,
      `Paid:     ${formatMinor(v.priceMinor)}`,
      `Code:     ${v.code}`,
      '',
      'Your voucher is redeemable after launch. Keep this code - you will use it to book.',
      '',
      'Eldava Health',
    ].join('\n'),
  });
}

export async function sendEnquiryToTeam(args: {
  team: string;
  kind: string;
  name: string;
  email: string;
  fields: Record<string, string>;
  id: string;
}) {
  const extras = Object.entries(args.fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return sendMail({
    to: args.team,
    replyTo: args.email,
    subject: `[Enquiry: ${args.kind}] ${args.name}`,
    text: [`Name:  ${args.name}`, `Email: ${args.email}`, `Kind:  ${args.kind}`, `Ref:   ${args.id}`, '', extras || '(no extra fields)'].join('\n'),
  });
}

export async function sendApplicationToTeam(args: { fullName: string; email: string; specialty: string; regulator: string; regNumber: string; country: string; id: string }) {
  return sendMail({
    to: 'clinicians@eldava.com',
    replyTo: args.email,
    subject: `[Clinician application] ${args.fullName} - ${args.specialty}`,
    text: [
      `Name:       ${args.fullName}`,
      `Email:      ${args.email}`,
      `Specialty:  ${args.specialty}`,
      `Regulator:  ${args.regulator} ${args.regNumber}`,
      `Country:    ${args.country}`,
      `Ref:        ${args.id}`,
      '',
      'Verify the registration number against the regulator before approving.',
    ].join('\n'),
  });
}
