import type { Appointment, Patient, Clinician, Voucher } from '@prisma/client';
import { formatMinor } from './services';

// Outbound email through Resend's REST API - plain fetch, no SDK. With no
// RESEND_API_KEY the message is logged to the server console instead of sent;
// every caller also persists what it needed to, so nothing is lost either way.

export function isLive(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const FROM = () => process.env.MAIL_FROM || 'Eldava Health <care@eldava.com>';

type Mail = { to: string | string[]; subject: string; text: string; replyTo?: string };

/// Returns true if the provider accepted the message, false if it was only
/// logged (no key) or the provider rejected it.
export async function sendMail(mail: Mail): Promise<boolean> {
  const to = Array.isArray(mail.to) ? mail.to : [mail.to];

  if (!isLive()) {
    console.log(`[mail:mock] to=${to.join(',')} subject="${mail.subject}"\n${mail.text}\n`);
    return false;
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
