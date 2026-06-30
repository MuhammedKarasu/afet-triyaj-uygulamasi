import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Archive, ArrowLeft, Filter, History, Search, UserRoundSearch } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PatientCard } from "@/components/patient-card";
import { requireUser } from "@/lib/auth";
import { LEGACY_RESOLVED_STATUSES, normalizeInterventionStatus, RESOLVED_STATUSES, RISK, STATUS, type InterventionStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vaka Geçmişi" };

type HistoryStatus = "ALL" | (typeof RESOLVED_STATUSES)[number];

const tabs: Array<{ value: HistoryStatus; label: string }> = [
  { value: "ALL", label: "Tüm Geçmiş" },
  { value: "TREATED", label: "Müdahale Edilenler" },
  { value: "TRANSFERRED", label: "Sevk Edilenler" },
  { value: "DISCHARGED", label: "Taburcu Edilenler" },
  { value: "DECEASED", label: "Vefat Edenler" },
];

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ q?: string; risk?: string; status?: string; order?: string }> }) {
  await requireUser();
  const { q = "", risk = "ALL", status = "ALL", order = "newest" } = await searchParams;
  const selectedStatus: HistoryStatus = (RESOLVED_STATUSES as readonly string[]).includes(status) ? status as HistoryStatus : "ALL";
  const statusValues = selectedStatus === "ALL"
    ? [...RESOLVED_STATUSES, ...LEGACY_RESOLVED_STATUSES]
    : selectedStatus === "TREATED" ? ["TREATED", ...LEGACY_RESOLVED_STATUSES] : [selectedStatus];
  const where: Prisma.PatientWhereInput = { interventionStatus: { in: statusValues } };

  if (q.trim()) where.OR = [
    { fullName: { contains: q.trim() } },
    { caseCode: { contains: q.trim() } },
    { locationDescription: { contains: q.trim() } },
  ];
  if (risk !== "ALL" && risk in RISK) where.riskLevel = risk;

  const [patients, grouped] = await Promise.all([
    prisma.patient.findMany({ where, orderBy: { lastStatusUpdateAt: order === "oldest" ? "asc" : "desc" } }),
    prisma.patient.groupBy({ by: ["interventionStatus"], where: { interventionStatus: { in: [...RESOLVED_STATUSES, ...LEGACY_RESOLVED_STATUSES] } }, _count: { _all: true } }),
  ]);

  const counts: Record<HistoryStatus, number> = { ALL: 0, TREATED: 0, TRANSFERRED: 0, DISCHARGED: 0, DECEASED: 0 };
  for (const item of grouped) {
    const normalized = normalizeInterventionStatus(item.interventionStatus);
    if (normalized in counts) counts[normalized as Exclude<HistoryStatus, "ALL">] += item._count._all;
    counts.ALL += item._count._all;
  }

  function tabHref(value: HistoryStatus) {
    const params = new URLSearchParams();
    if (value !== "ALL") params.set("status", value);
    if (q) params.set("q", q);
    if (risk !== "ALL") params.set("risk", risk);
    if (order !== "newest") params.set("order", order);
    const query = params.toString();
    return query ? `/history?${query}` : "/history";
  }

  const hasFilters = Boolean(q) || risk !== "ALL" || selectedStatus !== "ALL" || order !== "newest";

  return (
    <>
      <PageHeader
        eyebrow="Sonuçlanan vakalar"
        title="Vaka geçmişi"
        description="Müdahalesi tamamlanan, sevk edilen, taburcu edilen veya vefat kaydı oluşturulan vakalar veri kaybı olmadan burada saklanır."
        icon={History}
        actions={<Link href="/patients" className="btn-secondary"><ArrowLeft className="h-4 w-4" />Aktif vakalara dön</Link>}
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tabs.map((tab) => {
          const active = selectedStatus === tab.value;
          return <Link key={tab.value} href={tabHref(tab.value)} className={cn("inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-bold transition", active ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            {tab.label}<span className={cn("rounded-full px-1.5 py-0.5 text-[9px]", active ? "bg-white text-brand-700" : "bg-slate-100 text-slate-500")}>{counts[tab.value]}</span>
          </Link>;
        })}
      </div>

      <form className="panel mb-5 grid gap-3 p-3 sm:p-4 md:grid-cols-[1fr_180px_190px_auto]" method="get">
        {selectedStatus !== "ALL" && <input type="hidden" name="status" value={selectedStatus} />}
        <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-slate-400" /><input name="q" defaultValue={q} className="input pl-10" placeholder="Vaka kodu, isim veya konum ara" aria-label="Vaka geçmişinde ara" /></div>
        <div className="relative"><Filter className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-slate-400" /><select name="risk" defaultValue={risk} className="input pl-10" aria-label="Risk seviyesi"><option value="ALL">Tüm riskler</option>{Object.entries(RISK).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></div>
        <select name="order" defaultValue={order} className="input" aria-label="Tarihe göre sırala"><option value="newest">En son güncellenen</option><option value="oldest">En eski güncellenen</option></select>
        <button className="btn-secondary md:px-5" type="submit">Uygula</button>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs font-semibold text-slate-500"><b className="text-slate-900">{patients.length}</b> geçmiş kayıt gösteriliyor</p>
        {hasFilters && <Link href="/history" className="text-xs font-bold text-brand-700 hover:text-brand-900">Filtreleri temizle</Link>}
      </div>

      {patients.length ? <section className="space-y-3">
        {patients.map((patient) => <PatientCard key={patient.id} patient={patient} mode="history" />)}
      </section> : <EmptyState icon={UserRoundSearch} title={hasFilters ? "Bu filtreye uygun kayıt bulunamadı" : "Henüz sonuçlanmış vaka kaydı yok"} description={hasFilters ? "Durum, risk veya arama ölçütlerini değiştirerek tekrar deneyin." : "Sonuçlanan vakalar veri kaybı olmadan burada listelenecek."} action={hasFilters ? <Link href="/history" className="btn-secondary">Filtreleri temizle</Link> : undefined} />}

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-600">
        <Archive className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /><p className="text-xs leading-5">Vaka geçmişindeki kayıtlar silinmez. Yetkili kullanıcılar detay ekranından not ekleyerek vakayı tekrar Bekliyor veya Müdahale Ediliyor durumuna alabilir.</p>
      </div>
    </>
  );
}
