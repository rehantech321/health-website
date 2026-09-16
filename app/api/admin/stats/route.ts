import { Prisma } from '@prisma/client';
import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/// The dashboard: what the practice looks like right now, and what needs a
/// human. Revenue is the sum of PAID payments, in pence.
///
/// One SQL statement for every figure rather than fourteen Prisma counts: the
/// database is a remote pooled Postgres with ~200ms per round trip and the
/// pooler serialises a burst of queries, so fourteen in parallel took 5-12s.
/// Two round trips take well under a second.
export const GET = withErrors(async () =>
  requireAdmin(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    type Row = Record<string, bigint | number | null>;
    const [row] = await prisma.$queryRaw<Row[]>(Prisma.sql`
      select
        (select count(*) from "Patient")                                                          as "patients",
        (select count(*) from "Clinician")                                                        as "clinicians",
        (select count(*) from "Clinician" where "active")                                         as "activeClinicians",
        (select count(*) from "ClinicianApplication" where "status" in ('RECEIVED','UNDER_REVIEW')) as "pendingApplications",
        (select count(*) from "Enquiry" where "status" = 'NEW')                                   as "newEnquiries",
        (select count(*) from "Appointment" where "status" = 'CONFIRMED' and "startsAt" >= ${now})                            as "upcoming",
        (select count(*) from "Appointment" where "status" = 'CONFIRMED' and "startsAt" >= ${now} and "startsAt" <= ${weekAhead}) as "next7days",
        (select count(*) from "Appointment" where "status" = 'COMPLETED')                         as "completed",
        (select count(*) from "Appointment" where "status" = 'CONFIRMED' and "mode" = 'video' and "joinUrl" is null and "startsAt" >= ${now}) as "videoMissingLink",
        (select coalesce(sum("amountMinor"),0) from "Payment" where "status" = 'PAID')            as "revenueAll",
        (select coalesce(sum("amountMinor"),0) from "Payment" where "status" = 'PAID' and "updatedAt" >= ${monthStart}) as "revenueMonth",
        (select count(*) from "Voucher" where "status" in ('PAID','REDEEMED'))                    as "vouchersPaid",
        (select count(*) from "AppointmentSlot" s where s."startsAt" >= ${now} and not exists (select 1 from "Appointment" a where a."slotId" = s."id")) as "freeSlots"
    `);
    const n = (k: string) => Number(row?.[k] ?? 0);

    const recent = await prisma.$queryRaw<
      { id: string; reference: string; patient: string; clinician: string; serviceName: string; startsAt: Date; status: string; priceMinor: number; createdAt: Date }[]
    >(Prisma.sql`
      select a."id", a."reference", p."fullName" as "patient", c."displayName" as "clinician", a."serviceName", a."startsAt", a."status"::text as "status", a."priceMinor", a."createdAt"
      from "Appointment" a
      join "Patient" p on p."id" = a."patientId"
      join "Clinician" c on c."id" = a."clinicianId"
      where a."status" in ('CONFIRMED','COMPLETED')
      order by a."createdAt" desc
      limit 8
    `);

    return json({
      counts: {
        patients: n('patients'), clinicians: n('clinicians'), activeClinicians: n('activeClinicians'), pendingApplications: n('pendingApplications'),
        newEnquiries: n('newEnquiries'), upcoming: n('upcoming'), next7days: n('next7days'), completed: n('completed'),
        videoMissingLink: n('videoMissingLink'), vouchersPaid: n('vouchersPaid'), freeSlots: n('freeSlots'),
      },
      revenue: { allTimeMinor: n('revenueAll'), thisMonthMinor: n('revenueMonth') },
      recent: recent.map((a) => ({
        id: a.id, reference: a.reference, patient: a.patient, clinician: a.clinician,
        service: a.serviceName, startsAt: new Date(a.startsAt).toISOString(), status: a.status, priceMinor: Number(a.priceMinor), createdAt: new Date(a.createdAt).toISOString(),
      })),
    });
  })
);
