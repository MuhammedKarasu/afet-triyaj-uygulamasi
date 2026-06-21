import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, ClipboardPlus, Clock3, HeartPulse, Radio, Siren } from "lucide-react";
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
    prisma.patient.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } }),
    prisma.patient.findMany({ take: 4, where: { riskLevel: "RED", interventionStatus: { in: ["WAITING", "IN_PROGRESS"] } }, orderBy: { createdAt: "asc" } }),
  ]);

  const chartData = [
    { name: "Kırmızı", value: red }, { name: "Sarı", value: yellow },
    { name: "Yeşil", value: green }, { name: "Siyah / Gri", value: black },
  ];
  const percentage = (value: number) => total ? (value / total) * 100 : 0;
  const riskOverview = [
    { level: "RED", label: "Kırmızı", description: "Acil müdahale", value: red, priority: "P1", bar: "bg-red-500", surface: "from-red-50/80", text: "text-red-700" },
    { level: "YELLOW", label: "Sarı", description: "Geciktirilebilir", value: yellow, priority: "P2", bar: "bg-amber-400", surface: "from-amber-50/80", text: "text-amber-700" },
    { level: "GREEN", label: "Yeşil", description: "Hafif yaralı", value: green, priority: "P3", bar: "bg-emerald-500", surface: "from-emerald-50/80", text: "text-emerald-700" },
    { level: "BLACK", label: "Siyah / Gri", description: "Yaşam belirtisi yok", value: black, priority: "P4", bar: "bg-slate-600", surface: "from-slate-100/90", text: "text-slate-700" },
  ];

  return (
    <>
      <PageHeader eyebrow="Operasyon merkezi" title={`Merhaba, ${user.name.split(" ")[0]}`} description="Sahadaki güncel triyaj durumunu ve müdahale akışını buradan takip edin." icon={Activity}
        actions={<Link href="/patients/new" className="btn-primary"><ClipboardPlus className="h-4 w-4" /> Yeni yaralı kaydı</Link>} />

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-xs text-brand-900">
        <Radio className="h-4 w-4 text-brand-600" /><span className="font-bold">Canlı operasyon görünümü</span><span className="hidden text-brand-700/70 sm:inline">• Veriler SQLite kayıtlarından anlık hesaplanmaktadır.</span><span className="ml-auto rounded-full bg-white px-2.5 py-1 font-mono text-[9px] font-bold text-brand-700 shadow-sm">SENKRON</span>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam yaralı" value={total} detail="Sahadaki tüm kayıtlar" icon={HeartPulse} tone="blue" code="ALL" progress={100} />
        <StatCard label="Kırmızı öncelik" value={red} detail="Acil müdahale gerekiyor" icon={Siren} tone="red" code="P1" progress={percentage(red)} />
        <StatCard label="Müdahale bekliyor" value={waiting} detail="Henüz işlem başlatılmadı" icon={Clock3} tone="amber" code="QUEUE" progress={percentage(waiting)} />
        <StatCard label="İşlemi tamamlanan" value={completed} detail="Müdahale veya sevk edildi" icon={CheckCircle2} tone="emerald" code="DONE" progress={percentage(completed)} />
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div><h2 className="text-sm font-extrabold text-slate-900">Triyaj öncelik görünümü</h2><p className="mt-0.5 text-[10px] text-slate-400">Tüm vakaların sahadaki müdahale sırası</p></div>
          <span className="ml-auto rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wide text-slate-500">P1 → P4</span>
        </div>
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
          {riskOverview.map((item) => <div key={item.level} className={`relative overflow-hidden bg-gradient-to-br ${item.surface} to-white p-4 sm:p-5`}>
            <span className={`absolute inset-y-0 left-0 w-1 ${item.bar}`} />
            <div className="flex items-start justify-between gap-3">
              <div><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${item.bar}`} /><p className={`text-xs font-extrabold ${item.text}`}>{item.label}</p></div><p className="mt-1.5 text-[10px] font-medium text-slate-400">{item.description}</p></div>
              <span className={`rounded-md bg-white/80 px-1.5 py-1 font-mono text-[9px] font-black shadow-sm ${item.text}`}>{item.priority}</span>
            </div>
            <div className="mt-4 flex items-end justify-between"><p className="text-2xl font-black tracking-tight text-slate-900">{item.value}</p><p className="text-[10px] font-bold text-slate-400">%{Math.round(percentage(item.value))} pay</p></div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${item.bar}`} style={{ width: `${percentage(item.value)}%` }} /></div>
          </div>)}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <div className="panel p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="text-base font-extrabold text-slate-900">Risk dağılımı</h2><p className="mt-1 text-xs text-slate-400">Aktif kayıtların triyaj seviyeleri</p></div><span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">ANLIK</span></div>
          <RiskChart data={chartData} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-slate-100 pt-4">
            {chartData.map((item) => <div key={item.name} className="flex items-center gap-2 text-xs"><span className={`h-2.5 w-2.5 rounded-full ${item.name==='Kırmızı'?'bg-red-600':item.name==='Sarı'?'bg-amber-500':item.name==='Yeşil'?'bg-emerald-500':'bg-slate-500'}`}/><span className="text-slate-500">{item.name}</span><b className="ml-auto text-slate-800">{item.value}</b></div>)}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-base font-extrabold text-slate-900">Son eklenen yaralılar</h2><p className="mt-1 text-xs text-slate-400">En güncel saha kayıtları</p></div><Link href="/patients" className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900">Tümünü gör <ArrowRight className="h-3.5 w-3.5"/></Link></div>
          <div className="divide-y divide-slate-100">
            {recent.map((patient) => <Link key={patient.id} href={`/patients/${patient.id}`} className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/80 sm:px-6"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black ring-1 ring-inset ${patient.riskLevel==='RED'?'bg-red-50 text-red-700 ring-red-100':patient.riskLevel==='YELLOW'?'bg-amber-50 text-amber-700 ring-amber-100':patient.riskLevel==='GREEN'?'bg-emerald-50 text-emerald-700 ring-emerald-100':'bg-slate-100 text-slate-700 ring-slate-200'}`}>{patient.fullName.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-extrabold text-slate-800">{patient.fullName}</p><RiskBadge level={patient.riskLevel} compact /></div><p className="mt-1 truncate text-[10px] text-slate-400">{patient.locationDescription} • {formatDate(patient.createdAt)}</p></div><div className="hidden items-center gap-1.5 xl:flex"><span className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-500"><b className="text-slate-800">{patient.pulse}</b> nabız</span><span className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-500"><b className={patient.spo2<90?'text-red-600':'text-slate-800'}>%{patient.spo2}</b> SpO₂</span></div><StatusBadge status={patient.interventionStatus}/><ArrowRight className="hidden h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600 sm:block"/></Link>)}
          </div>
        </div>
      </section>

      <section className="panel mt-5 overflow-hidden border-red-100">
        <div className="flex items-center gap-3 border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-5 py-4 sm:px-6"><span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white shadow-md shadow-red-200"><Siren className="h-[18px] w-[18px]" /></span><div><h2 className="text-sm font-extrabold text-red-950">Acil müdahale kuyruğu</h2><p className="text-[10px] text-red-700/60">Kırmızı triyajlı ve işlemi tamamlanmamış kayıtlar</p></div><span className="ml-auto rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white/90" />{urgent.length} AKTİF</span></div>
        {urgent.length ? <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">{urgent.map((patient, index) => <Link href={`/patients/${patient.id}`} key={patient.id} className="group flex items-center gap-3 p-5 transition hover:bg-red-50/40"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-50 font-mono text-[10px] font-black text-red-700 ring-1 ring-inset ring-red-100">P1.{index+1}</span><div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-slate-900">{patient.fullName}</p><p className="mt-1 truncate text-[11px] text-slate-400">{patient.riskReason}</p><div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-slate-400"><span>Nabız <b className="text-red-600">{patient.pulse}</b></span><span className="h-3 w-px bg-slate-200"/><span>SpO₂ <b className="text-red-600">%{patient.spo2}</b></span></div></div><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-red-600"/></Link>)}</div> : <p className="p-6 text-sm text-slate-500">Acil müdahale kuyruğunda kayıt bulunmuyor.</p>}
      </section>
    </>
  );
}
