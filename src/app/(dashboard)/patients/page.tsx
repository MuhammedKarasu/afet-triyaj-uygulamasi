import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Archive, ClipboardPlus, HeartPulse, Radio, UserRoundSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { PatientCard } from "@/components/patient-card";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { EmptyState } from "@/components/empty-state";
import { ACTIVE_STATUSES, RISK, STATUS, type InterventionStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const riskOrder: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2, BLACK: 3 };
const statusOrder: Record<string, number> = { WAITING: 0, IN_PROGRESS: 1 };
type ActiveTab = "ALL" | (typeof ACTIVE_STATUSES)[number];

const tabs: Array<{ value: ActiveTab; label: string }> = [
  { value: "ALL", label: "Aktif Müdahale" },
  { value: "WAITING", label: "Bekleyen" },
  { value: "IN_PROGRESS", label: "Müdahale Ediliyor" },
];

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ q?: string; risk?: string; status?: string }> }) {
  await requireUser();
  const { q = "", risk = "ALL", status = "ALL" } = await searchParams;
  const selectedStatus = (ACTIVE_STATUSES as readonly string[]).includes(status) ? status as InterventionStatus : "ALL";
  const where: Prisma.PatientWhereInput = {
    interventionStatus: selectedStatus === "ALL" ? { in: [...ACTIVE_STATUSES] } : selectedStatus,
  };

  if (q.trim()) where.OR = [
    { fullName: { contains: q.trim() } },
    { caseCode: { contains: q.trim() } },
    { locationDescription: { contains: q.trim() } },
    { identityNumber: { contains: q.trim() } },
  ];
  if (risk !== "ALL" && risk in RISK) where.riskLevel = risk;

  const [patients, activeTotal, waitingCount, inProgressCount] = await Promise.all([
    prisma.patient.findMany({ where, include: { assignments: { include: { team: { select: { name: true } } }, orderBy: { assignedAt: "desc" } } } }),
    prisma.patient.count({ where: { interventionStatus: { in: [...ACTIVE_STATUSES] } } }),
    prisma.patient.count({ where: { interventionStatus: "WAITING" } }),
    prisma.patient.count({ where: { interventionStatus: "IN_PROGRESS" } }),
  ]);

  patients.sort((a, b) =>
    (riskOrder[a.riskLevel] ?? 9) - (riskOrder[b.riskLevel] ?? 9)
    || (statusOrder[a.interventionStatus] ?? 9) - (statusOrder[b.interventionStatus] ?? 9)
    || a.createdAt.getTime() - b.createdAt.getTime(),
  );

  const counts = { ALL: activeTotal, WAITING: waitingCount, IN_PROGRESS: inProgressCount };
  const hasFilters = Boolean(q) || risk !== "ALL" || selectedStatus !== "ALL";

  return (
    <>
      <PageHeader
        eyebrow="Canlı operasyon"
        title="Aktif vakalar"
        description="Yalnızca müdahale bekleyen veya müdahalesi devam eden saha kayıtları gösterilir."
        icon={HeartPulse}
        actions={<>
          <Link href="/history" className="btn-secondary"><Archive className="h-4 w-4" />Vaka geçmişi</Link>
          <Link href="/patients/new" className="btn-primary"><ClipboardPlus className="h-4 w-4" />Yeni yaralı</Link>
        </>}
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tabs.map((tab) => {
          const active = selectedStatus === tab.value;
          const href = tab.value === "ALL" ? "/patients" : `/patients?status=${tab.value}`;
          return <Link key={tab.value} href={href} className={cn("inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-bold transition", active ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            {tab.value === "ALL" && <Radio className="h-3.5 w-3.5" />}{tab.label}<span className={cn("rounded-full px-1.5 py-0.5 text-[9px]", active ? "bg-white text-brand-700" : "bg-slate-100 text-slate-500")}>{counts[tab.value]}</span>
          </Link>;
        })}
      </div>

      <SearchFilterBar query={q} risk={risk} status={selectedStatus} statusOptions={ACTIVE_STATUSES} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs font-semibold text-slate-500"><b className="text-slate-900">{patients.length}</b> aktif vaka gösteriliyor</p>
        {hasFilters && <Link href="/patients" className="text-xs font-bold text-brand-700 hover:text-brand-900">Filtreleri temizle</Link>}
      </div>

      {patients.length ? <section className="space-y-3">
        {patients.map((patient) => <PatientCard key={patient.id} patient={patient} />)}
      </section> : <EmptyState icon={UserRoundSearch} title={hasFilters ? "Bu filtreye uygun kayıt bulunamadı" : "Şu anda aktif müdahale bekleyen vaka bulunmuyor"} description={hasFilters ? "Arama veya filtre ölçütlerini değiştirerek tekrar deneyin." : "Yeni saha kayıtları oluşturulduğunda burada risk önceliğine göre listelenecek."} action={hasFilters ? <Link href="/patients" className="btn-secondary">Filtreleri temizle</Link> : <Link href="/history" className="btn-secondary">Vaka geçmişini aç</Link>} />}

      <p className="mt-5 text-center text-xs text-slate-400">Aktif sıralama risk önceliği, ardından müdahale durumu ve kayıt zamanına göre yapılır.</p>
    </>
  );
}
