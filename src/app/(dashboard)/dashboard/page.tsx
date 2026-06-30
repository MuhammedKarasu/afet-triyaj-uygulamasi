import Link from "next/link";
import { Activity, AlertTriangle, Ambulance, ArrowRight, CheckCircle2, ClipboardCheck, ClipboardPlus, Clock3, ListTree, MapPin, MapPinned, Radio, Siren, UserCheck, Users, UserX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { RiskChart } from "@/components/risk-chart";
import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { ACTIVE_STATUSES, LEGACY_RESOLVED_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const activeStatuses = [...ACTIVE_STATUSES];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const [
    total, activeTotal, waiting, inProgress, treated, transferred, discharged, deceased,
    activeRed, activeYellow, activeGreen, activeBlack, recentActive, urgent, recentEvents,
    todayCreated, todayTreated, todayTransferred,
    activeWithLocation, activeWithoutLocation, assignedActive, unassignedActive, availableTeams, onDutyTeams,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses } } }),
    prisma.patient.count({ where: { interventionStatus: "WAITING" } }),
    prisma.patient.count({ where: { interventionStatus: "IN_PROGRESS" } }),
    prisma.patient.count({ where: { interventionStatus: { in: ["TREATED", ...LEGACY_RESOLVED_STATUSES] } } }),
    prisma.patient.count({ where: { interventionStatus: "TRANSFERRED" } }),
    prisma.patient.count({ where: { interventionStatus: "DISCHARGED" } }),
    prisma.patient.count({ where: { interventionStatus: "DECEASED" } }),
    prisma.patient.count({ where: { riskLevel: "RED", interventionStatus: { in: activeStatuses } } }),
    prisma.patient.count({ where: { riskLevel: "YELLOW", interventionStatus: { in: activeStatuses } } }),
    prisma.patient.count({ where: { riskLevel: "GREEN", interventionStatus: { in: activeStatuses } } }),
    prisma.patient.count({ where: { riskLevel: "BLACK", interventionStatus: { in: activeStatuses } } }),
    prisma.patient.findMany({ take: 5, where: { interventionStatus: { in: activeStatuses } }, orderBy: { createdAt: "desc" } }),
    prisma.patient.findMany({ take: 4, where: { riskLevel: "RED", interventionStatus: { in: activeStatuses } }, orderBy: { createdAt: "asc" } }),
    prisma.caseEvent.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { patient: { select: { id: true, caseCode: true, fullName: true, interventionStatus: true } }, createdBy: { select: { name: true } } } }),
    prisma.patient.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.patient.count({ where: { interventionStatus: { in: ["TREATED", ...LEGACY_RESOLVED_STATUSES] }, lastStatusUpdateAt: { gte: startOfToday } } }),
    prisma.patient.count({ where: { interventionStatus: "TRANSFERRED", lastStatusUpdateAt: { gte: startOfToday } } }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, latitude: { not: null }, longitude: { not: null } } }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, OR: [{ latitude: null }, { longitude: null }] } }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, assignments: { some: { completedAt: null } } } }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, assignments: { none: { completedAt: null } } } }),
    prisma.team.count({ where: { status: "AVAILABLE", available: true, isActive: true } }),
    prisma.team.count({ where: { status: "ON_DUTY", isActive: true } }),
  ]);

  const chartData = [
    { name: "Kırmızı", value: activeRed },
    { name: "Sarı", value: activeYellow },
    { name: "Yeşil", value: activeGreen },
    { name: "Siyah / Gri", value: activeBlack },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operasyon merkezi"
        title={`Merhaba, ${user.name.split(" ")[0]}`}
        description="Aktif triyaj kuyruğunu ve sonuçlanan vakaları birbirinden ayrılmış olarak takip edin."
        icon={Activity}
        actions={<Link href="/patients/new" className="btn-primary"><ClipboardPlus className="h-4 w-4" />Yeni yaralı kaydı</Link>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs text-brand-900">
        <Radio className="h-4 w-4 text-brand-600" /><span className="font-semibold">Canlı operasyon özeti</span>
        <span className="text-brand-700/70">Bugün <b>{todayCreated}</b> vaka kaydedildi. <b>{activeRed}</b> aktif kırmızı vaka var. <b>{todayTreated}</b> vaka müdahale edildi, <b>{todayTransferred}</b> vaka sevk edildi.</span>
        <span className="hidden text-brand-700/50 xl:inline">Toplam {total} kayıt • {activeTotal} aktif</span>
        <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" aria-label="Senkronizasyon aktif" />
      </div>

      <section className="mb-5">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-sm font-extrabold text-slate-900">Konum ve ekip özeti</h2><p className="mt-0.5 text-xs text-slate-500">Harita görünümü ve ekip atama durumları</p></div><Link href="/map" className="text-xs font-bold text-brand-700">Saha haritasını aç</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
          <StatCard label="Konumlu Aktif" value={activeWithLocation} detail="Haritada görünüyor" icon={MapPin} tone="emerald" />
          <StatCard label="Konumsuz Aktif" value={activeWithoutLocation} detail="Koordinat bekliyor" icon={MapPinned} tone="amber" />
          <StatCard label="Ekip Atanmış" value={assignedActive} detail="Aktif vaka" icon={Ambulance} tone="blue" />
          <StatCard label="Ekip Bekleyen" value={unassignedActive} detail="Atama bekliyor" icon={Users} tone="red" />
          <StatCard label="Uygun Ekip" value={availableTeams} detail="Atamaya hazır" icon={Users} tone="emerald" />
          <StatCard label="Görevde Ekip" value={onDutyTeams} detail="Sahada aktif" icon={Ambulance} tone="violet" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-sm font-extrabold text-slate-900">Aktif operasyon</h2><p className="mt-0.5 text-xs text-slate-500">Bekleyen ve müdahalesi devam eden vakalar</p></div><Link href="/patients" className="text-xs font-bold text-brand-700">Aktif vakaları aç</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-5">
          <StatCard label="Aktif Bekleyen" value={waiting} detail="Müdahale kuyruğu" icon={Clock3} tone="violet" />
          <StatCard label="Müdahale Ediliyor" value={inProgress} detail="Sahada işlem sürüyor" icon={Activity} tone="blue" />
          <StatCard label="Aktif Kırmızı" value={activeRed} detail="Acil müdahale" icon={Siren} tone="red" />
          <StatCard label="Aktif Sarı" value={activeYellow} detail="Orta öncelik" icon={AlertTriangle} tone="amber" />
          <StatCard label="Aktif Yeşil" value={activeGreen} detail="Hafif risk" icon={CheckCircle2} tone="emerald" />
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="text-base font-bold text-slate-900">Aktif risk dağılımı</h2><p className="mt-1 text-xs text-slate-500">Yalnızca devam eden operasyon kayıtları</p></div><span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700">{activeTotal} AKTİF</span></div>
          <RiskChart data={chartData} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-slate-100 pt-4">
            {chartData.map((item) => <div key={item.name} className="flex items-center gap-2 text-xs"><span className={`h-2.5 w-2.5 rounded-full ${item.name === "Kırmızı" ? "bg-red-600" : item.name === "Sarı" ? "bg-amber-500" : item.name === "Yeşil" ? "bg-emerald-500" : "bg-slate-500"}`} /><span className="text-slate-500">{item.name}</span><b className="ml-auto text-slate-800">{item.value}</b></div>)}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-base font-bold text-slate-900">Son aktif vakalar</h2><p className="mt-1 text-xs text-slate-500">En güncel bekleyen ve devam eden kayıtlar</p></div><Link href="/patients" className="flex items-center gap-1 text-xs font-semibold text-brand-700">Tümünü gör <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          <div className="divide-y divide-slate-100">
            {recentActive.map((patient) => <Link key={patient.id} href={`/patients/${patient.id}`} className="group flex min-h-16 items-center gap-3 px-5 py-3 transition hover:bg-slate-50 sm:px-6"><div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${patient.riskLevel === "RED" ? "bg-rose-50 text-rose-700" : patient.riskLevel === "YELLOW" ? "bg-amber-50 text-amber-700" : patient.riskLevel === "GREEN" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{patient.fullName.split(" ").map((name) => name[0]).slice(0, 2).join("")}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{patient.caseCode && <span className="font-mono text-[9px] font-bold text-slate-400">{patient.caseCode}</span>}<p className="truncate text-sm font-semibold text-slate-800">{patient.fullName}</p><RiskBadge level={patient.riskLevel} compact /></div><p className="mt-1 truncate text-xs text-slate-500">{patient.locationDescription} • {formatDate(patient.createdAt)}</p></div><StatusBadge status={patient.interventionStatus} /><ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" /></Link>)}
            {!recentActive.length && <p className="p-6 text-sm text-slate-500">Aktif vaka bulunmuyor.</p>}
          </div>
        </div>
      </section>

      <section className="panel mt-5 overflow-hidden border-rose-100">
        <div className="flex items-center gap-3 border-b border-rose-100 bg-rose-50/60 px-5 py-4 sm:px-6"><span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-700"><Siren className="h-[18px] w-[18px]" /></span><div><h2 className="text-sm font-bold text-slate-900">Acil müdahale kuyruğu</h2><p className="text-xs text-slate-500">Yalnızca aktif kırmızı triyaj kayıtları</p></div><span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">{urgent.length} aktif</span></div>
        {urgent.length ? <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">{urgent.map((patient) => <Link href={`/patients/${patient.id}`} key={patient.id} className="group flex items-center gap-3 p-4 transition hover:bg-rose-50/40 sm:p-5"><span className="h-8 w-1 shrink-0 rounded-full bg-rose-400" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{patient.caseCode && <span className="font-mono text-[9px] font-bold text-rose-500">{patient.caseCode}</span>}<p className="truncate text-sm font-semibold text-slate-900">{patient.fullName}</p><StatusBadge status={patient.interventionStatus} /></div><p className="mt-1 truncate text-xs text-slate-500">Nabız {patient.pulse} • SpO₂ %{patient.spo2}</p></div><ArrowRight className="h-4 w-4 text-slate-300" /></Link>)}</div> : <p className="p-6 text-sm text-slate-500">Acil müdahale kuyruğunda kayıt bulunmuyor.</p>}
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-sm font-extrabold text-slate-900">Sonuçlanan vakalar</h2><p className="mt-0.5 text-xs text-slate-500">Aktif operasyondan ayrılan kayıtlar</p></div><Link href="/history" className="text-xs font-bold text-brand-700">Vaka geçmişini aç</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Müdahale Edilen" value={treated} detail="İşlem tamamlandı" icon={ClipboardCheck} tone="emerald" />
          <StatCard label="Sevk Edilen" value={transferred} detail="Sağlık kurumuna sevk" icon={Ambulance} tone="blue" />
          <StatCard label="Taburcu Edilen" value={discharged} detail="Saha süreci kapandı" icon={UserCheck} tone="emerald" />
          <StatCard label="Vefat Eden" value={deceased} detail="Sonuçlanan kayıt" icon={UserX} tone="slate" />
        </div>

        <div className="panel mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-2"><ListTree className="h-4 w-4 text-brand-600" /><div><h3 className="text-sm font-bold text-slate-900">Son hareketler</h3><p className="text-[10px] text-slate-400">Operasyon merkezindeki en güncel vaka olayları</p></div></div><span className="rounded-full bg-brand-50 px-2 py-1 text-[9px] font-bold text-brand-700">CANLI</span></div>
          <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
            {recentEvents.map((event) => <Link key={event.id} href={`/patients/${event.patient.id}${activeStatuses.includes(event.patient.interventionStatus as typeof activeStatuses[number]) ? "" : "?from=history"}`} className="flex items-start gap-3 p-4 transition hover:bg-slate-50 sm:px-5"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-50"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{event.patient.caseCode && <span className="font-mono text-[9px] font-bold text-brand-700">{event.patient.caseCode}</span>}<p className="truncate text-xs font-bold text-slate-800">{event.patient.fullName}</p></div><p className="mt-1 text-xs leading-5 text-slate-600">{event.title}</p><p className="mt-1 text-[10px] text-slate-400">{event.createdBy.name} • {formatDate(event.createdAt)}</p></div></Link>)}
            {!recentEvents.length && <p className="p-5 text-sm text-slate-500">Henüz operasyon hareketi bulunmuyor.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
