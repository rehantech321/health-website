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
