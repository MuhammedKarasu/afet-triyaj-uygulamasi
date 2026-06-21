import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { ClipboardPlus, HeartPulse, UserRoundSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { PatientCard } from "@/components/patient-card";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { EmptyState } from "@/components/empty-state";
import { RISK, STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const riskOrder: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2, BLACK: 3 };

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ q?: string; risk?: string; status?: string }> }) {
  await requireUser();
  const { q = "", risk = "ALL", status = "ALL" } = await searchParams;
  const where: Prisma.PatientWhereInput = {};
  if (q.trim()) where.OR = [
    { fullName: { contains: q.trim() } },
    { locationDescription: { contains: q.trim() } },
    { identityNumber: { contains: q.trim() } },
  ];
  if (risk !== "ALL" && risk in RISK) where.riskLevel = risk;
  if (status !== "ALL" && status in STATUS) where.interventionStatus = status;

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.patient.count(),
  ]);
  patients.sort((a, b) => (riskOrder[a.riskLevel] ?? 9) - (riskOrder[b.riskLevel] ?? 9) || b.createdAt.getTime() - a.createdAt.getTime());

  const hasFilters = q || risk !== "ALL" || status !== "ALL";
  return (
    <>
      <PageHeader eyebrow="Saha kayıtları" title="Yaralı listesi" description={`${total} toplam kayıt içinden müdahale önceliğine göre sıralanmış saha görünümü.`} icon={HeartPulse}
        actions={<Link href="/patients/new" className="btn-primary"><ClipboardPlus className="h-4 w-4"/>Yeni yaralı</Link>} />

      <SearchFilterBar query={q} risk={risk} status={status} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1"><div className="flex items-center gap-3"><p className="text-xs font-semibold text-slate-500"><b className="text-slate-900">{patients.length}</b> kayıt gösteriliyor</p><span className="hidden h-3 w-px bg-slate-200 sm:block"/><span className="hidden items-center gap-1.5 text-[10px] font-bold text-slate-400 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-brand-500"/>Risk önceliği aktif</span></div>{hasFilters && <Link href="/patients" className="text-xs font-bold text-brand-700 hover:text-brand-900">Filtreleri temizle</Link>}</div>

      {patients.length ? <section className="space-y-3">
        {patients.map((patient) => <PatientCard key={patient.id} patient={patient} />)}
      </section> : <EmptyState icon={UserRoundSearch} title="Kayıt bulunamadı" description="Arama veya filtre ölçütlerini değiştirerek tekrar deneyin." action={hasFilters ? <Link href="/patients" className="btn-secondary">Filtreleri temizle</Link> : undefined} />}

      <p className="mt-5 text-center text-xs text-slate-400">Kırmızı riskli kayıtlar otomatik olarak listenin başında gösterilir.</p>
    </>
  );
}
