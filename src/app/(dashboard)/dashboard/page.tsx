import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, ClipboardPlus, Clock3, HeartPulse, Radio, Siren } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { RiskChart } from "@/components/risk-chart";
import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [total, red, yellow, green, black, waiting, completed, recent, urgent] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { riskLevel: "RED" } }),
    prisma.patient.count({ where: { riskLevel: "YELLOW" } }),
    prisma.patient.count({ where: { riskLevel: "GREEN" } }),
    prisma.patient.count({ where: { riskLevel: "BLACK" } }),
    prisma.patient.count({ where: { interventionStatus: "WAITING" } }),
    prisma.patient.count({ where: { interventionStatus: { in: ["COMPLETED", "TRANSFERRED"] } } }),
    prisma.patient.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.patient.findMany({ take: 4, where: { riskLevel: "RED", interventionStatus: { in: ["WAITING", "IN_PROGRESS"] } }, orderBy: { createdAt: "asc" } }),
  ]);

  const chartData = [
    { name: "Kırmızı", value: red }, { name: "Sarı", value: yellow },
    { name: "Yeşil", value: green }, { name: "Siyah / Gri", value: black },
  ];

  return (
    <>
      <PageHeader eyebrow="Operasyon merkezi" title={`Merhaba, ${user.name.split(" ")[0]}`} description="Sahadaki güncel triyaj durumunu ve müdahale akışını buradan takip edin." icon={Activity}
        actions={<Link href="/patients/new" className="btn-primary"><ClipboardPlus className="h-4 w-4" /> Yeni yaralı kaydı</Link>} />

      <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs text-brand-900">
        <Radio className="h-4 w-4 text-brand-600" /><span className="font-semibold">Canlı operasyon özeti</span><span className="hidden text-brand-700/60 sm:inline">Veriler anlık hesaplanır.</span><span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" aria-label="Senkronizasyon aktif" />
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Toplam yaralı" value={total} detail="Tüm kayıtlar" icon={HeartPulse} tone="blue" />
        <StatCard label="Kırmızı risk" value={red} detail="Acil müdahale" icon={Siren} tone="red" />
        <StatCard label="Sarı risk" value={yellow} detail="Orta öncelik" icon={AlertTriangle} tone="amber" />
        <StatCard label="Yeşil risk" value={green} detail="Hafif yaralı" icon={CheckCircle2} tone="emerald" />
        <StatCard label="Bekleyen" value={waiting} detail="Müdahale kuyruğu" icon={Clock3} tone="violet" />
        <StatCard label="Müdahale edilen" value={completed} detail="Tamamlandı / sevk" icon={ClipboardCheck} tone="slate" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="text-base font-bold text-slate-900">Risk dağılımı</h2><p className="mt-1 text-xs text-slate-500">Tüm kayıtların triyaj seviyeleri</p></div><span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">ANLIK</span></div>
          <RiskChart data={chartData} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-slate-100 pt-4">
            {chartData.map((item) => <div key={item.name} className="flex items-center gap-2 text-xs"><span className={`h-2.5 w-2.5 rounded-full ${item.name==='Kırmızı'?'bg-red-600':item.name==='Sarı'?'bg-amber-500':item.name==='Yeşil'?'bg-emerald-500':'bg-slate-500'}`}/><span className="text-slate-500">{item.name}</span><b className="ml-auto text-slate-800">{item.value}</b></div>)}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-base font-bold text-slate-900">Son kayıtlar</h2><p className="mt-1 text-xs text-slate-500">En güncel saha girişleri</p></div><Link href="/patients" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900">Tümünü gör <ArrowRight className="h-3.5 w-3.5"/></Link></div>
          <div className="divide-y divide-slate-100">
            {recent.map((patient) => <Link key={patient.id} href={`/patients/${patient.id}`} className="group flex min-h-16 items-center gap-3 px-5 py-3 transition hover:bg-slate-50 sm:px-6"><div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${patient.riskLevel==='RED'?'bg-rose-50 text-rose-700':patient.riskLevel==='YELLOW'?'bg-amber-50 text-amber-700':patient.riskLevel==='GREEN'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-700'}`}>{patient.fullName.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-slate-800">{patient.fullName}</p><RiskBadge level={patient.riskLevel} compact /></div><p className="mt-1 truncate text-xs text-slate-500">{patient.locationDescription} • {formatDate(patient.createdAt)}</p></div><StatusBadge status={patient.interventionStatus}/><ArrowRight className="hidden h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600 sm:block"/></Link>)}
          </div>
        </div>
      </section>

      <section className="panel mt-5 overflow-hidden border-rose-100">
        <div className="flex items-center gap-3 border-b border-rose-100 bg-rose-50/60 px-5 py-4 sm:px-6"><span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-700"><Siren className="h-[18px] w-[18px]" /></span><div><h2 className="text-sm font-bold text-slate-900">Acil müdahale kuyruğu</h2><p className="text-xs text-slate-500">Tamamlanmamış kırmızı triyaj kayıtları</p></div><span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">{urgent.length} aktif</span></div>
        {urgent.length ? <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">{urgent.map((patient) => <Link href={`/patients/${patient.id}`} key={patient.id} className="group flex items-center gap-3 p-4 transition hover:bg-rose-50/40 sm:p-5"><span className="h-8 w-1 shrink-0 rounded-full bg-rose-400"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{patient.fullName}</p><p className="mt-1 truncate text-xs text-slate-500">Nabız {patient.pulse} • SpO₂ %{patient.spo2}</p></div><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-rose-600"/></Link>)}</div> : <p className="p-6 text-sm text-slate-500">Acil müdahale kuyruğunda kayıt bulunmuyor.</p>}
      </section>
    </>
  );
}
