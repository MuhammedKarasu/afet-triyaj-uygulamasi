import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, ClipboardPlus, Filter, HeartPulse, MapPin, Search, SlidersHorizontal, UserRoundSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { RISK, STATUS, type RiskLevel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const riskOrder: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2, BLACK: 3 };
const borderColor: Record<string, string> = { RED: "bg-red-600", YELLOW: "bg-amber-500", GREEN: "bg-emerald-500", BLACK: "bg-slate-600" };
const riskSurface: Record<string, string> = { RED: "hover:border-red-200 hover:bg-red-50/20", YELLOW: "hover:border-amber-200 hover:bg-amber-50/20", GREEN: "hover:border-emerald-200 hover:bg-emerald-50/20", BLACK: "hover:border-slate-300 hover:bg-slate-50/70" };
const riskAvatar: Record<string, string> = { RED: "bg-red-50 text-red-700 ring-red-100", YELLOW: "bg-amber-50 text-amber-700 ring-amber-100", GREEN: "bg-emerald-50 text-emerald-700 ring-emerald-100", BLACK: "bg-slate-100 text-slate-700 ring-slate-200" };
const genderLabel: Record<string, string> = { FEMALE: "Kadın", MALE: "Erkek", OTHER: "Diğer / Bilinmiyor" };

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
    prisma.patient.findMany({ where, include: { createdBy: { select: { name: true } }, assignments: { include: { team: { select: { name: true } } } } }, orderBy: { createdAt: "desc" } }),
    prisma.patient.count(),
  ]);
  patients.sort((a, b) => (riskOrder[a.riskLevel] ?? 9) - (riskOrder[b.riskLevel] ?? 9) || b.createdAt.getTime() - a.createdAt.getTime());

  const hasFilters = q || risk !== "ALL" || status !== "ALL";
  return (
    <>
      <PageHeader eyebrow="Saha kayıtları" title="Yaralı listesi" description={`${total} toplam kayıt içinden müdahale önceliğine göre sıralanmış saha görünümü.`} icon={HeartPulse}
        actions={<Link href="/patients/new" className="btn-primary"><ClipboardPlus className="h-4 w-4"/>Yeni yaralı</Link>} />

      <form className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_190px_210px_auto]" method="get">
        <div className="relative"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"/><input name="q" defaultValue={q} className="input pl-10" placeholder="Ad, kimlik veya konum ara..."/></div>
        <div className="relative"><Filter className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"/><select name="risk" defaultValue={risk} className="input pl-10"><option value="ALL">Tüm riskler</option>{Object.entries(RISK).map(([value,item])=><option value={value} key={value}>{item.label}</option>)}</select></div>
        <div className="relative"><SlidersHorizontal className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"/><select name="status" defaultValue={status} className="input pl-10"><option value="ALL">Tüm müdahale durumları</option>{Object.entries(STATUS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></div>
        <button className="btn-secondary" type="submit">Filtrele</button>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1"><div className="flex items-center gap-3"><p className="text-xs font-semibold text-slate-500"><b className="text-slate-900">{patients.length}</b> kayıt gösteriliyor</p><span className="hidden h-3 w-px bg-slate-200 sm:block"/><span className="hidden items-center gap-1.5 text-[10px] font-bold text-slate-400 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-brand-500"/>Risk önceliği aktif</span></div>{hasFilters && <Link href="/patients" className="text-xs font-bold text-brand-700 hover:text-brand-900">Filtreleri temizle</Link>}</div>

      {patients.length ? <section className="space-y-3">
        {patients.map((patient) => (
          <Link href={`/patients/${patient.id}`} key={patient.id} className={`panel group relative flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-stretch ${riskSurface[patient.riskLevel] ?? riskSurface.BLACK}`}>
            <span className={`absolute inset-y-0 left-0 w-1.5 ${borderColor[patient.riskLevel] ?? 'bg-slate-400'}`} />
            <div className="flex min-w-0 flex-1 items-center gap-4 p-4 pl-6 sm:p-5 sm:pl-7">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-black ring-1 ring-inset ${riskAvatar[patient.riskLevel] ?? riskAvatar.BLACK}`}>{patient.fullName.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5"><h2 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{patient.fullName}</h2><RiskBadge level={patient.riskLevel}/><StatusBadge status={patient.interventionStatus}/></div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400"><span className="font-medium text-slate-500">{patient.age} yaş • {genderLabel[patient.gender]}</span><span className="flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3 text-brand-600"/><span className="truncate">{patient.locationDescription}</span></span><span className="font-mono text-[9px]">#{patient.id.slice(-6).toUpperCase()}</span><span>{formatDate(patient.createdAt)}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/60 sm:w-[330px] sm:border-l sm:border-t-0">
              <div className="grid place-items-center border-r border-slate-100 px-3 py-3 text-center"><p className={`text-lg font-black ${patient.pulse>130?'text-red-600':patient.pulse>=100?'text-amber-600':'text-slate-800'}`}>{patient.pulse}</p><p className="mt-0.5 text-[8px] font-extrabold uppercase tracking-[.12em] text-slate-400">Nabız / dk</p></div>
              <div className="grid place-items-center border-r border-slate-100 px-3 py-3 text-center"><p className={`text-lg font-black ${patient.spo2<90?'text-red-600':patient.spo2<=94?'text-amber-600':'text-slate-800'}`}>%{patient.spo2}</p><p className="mt-0.5 text-[8px] font-extrabold uppercase tracking-[.12em] text-slate-400">SpO₂</p></div>
              <div className="grid place-items-center px-3 py-3 text-center"><p className="max-w-24 truncate text-[11px] font-extrabold text-slate-700">{patient.assignments[0]?.team.name ?? "Atanmadı"}</p><p className="mt-1 text-[8px] font-extrabold uppercase tracking-[.12em] text-slate-400">Saha ekibi</p></div>
            </div>
            <div className="hidden w-12 place-items-center bg-white text-slate-300 transition group-hover:text-brand-600 sm:grid"><ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/></div>
          </Link>
        ))}
      </section> : <div className="panel grid min-h-72 place-items-center p-8 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><UserRoundSearch className="h-6 w-6"/></div><h2 className="mt-4 text-base font-extrabold text-slate-800">Kayıt bulunamadı</h2><p className="mt-1 text-sm text-slate-400">Arama veya filtre ölçütlerini değiştirerek tekrar deneyin.</p>{hasFilters && <Link href="/patients" className="btn-secondary mt-4">Filtreleri temizle</Link>}</div></div>}

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-400">
        <span className="font-bold uppercase tracking-wide text-slate-500">Öncelik sırası</span>{(["RED","YELLOW","GREEN","BLACK"] as RiskLevel[]).map(level=><span key={level} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${borderColor[level]}`}/>{RISK[level].label}</span>)}<span className="ml-auto">Kırmızı kayıtlar otomatik olarak en üstte gösterilir.</span>
      </div>
    </>
  );
}
