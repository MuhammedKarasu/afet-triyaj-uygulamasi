import Link from "next/link";
import { ArrowRight, Crosshair, LocateFixed, Map, MapPin, Navigation, Radio, Route, Satellite } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

const pinColor: Record<string,string> = { RED:"bg-red-600",YELLOW:"bg-amber-500",GREEN:"bg-emerald-500",BLACK:"bg-slate-700" };

export default async function LocationsPage() {
  await requireUser();
  const patients = await prisma.patient.findMany({ orderBy: { createdAt: "desc" }, include: { assignments: { include: { team: { select: { name: true } } } } } });
  const mapped = patients.filter(p=>p.latitude!==null && p.longitude!==null);
  const minLat = Math.min(...mapped.map(p=>p.latitude!), 38.41), maxLat = Math.max(...mapped.map(p=>p.latitude!),38.43);
  const minLng = Math.min(...mapped.map(p=>p.longitude!),27.12), maxLng = Math.max(...mapped.map(p=>p.longitude!),27.14);
  const position = (lat:number,lng:number) => ({ left: `${12 + ((lng-minLng)/Math.max(maxLng-minLng,.001))*76}%`, top: `${12 + (1-(lat-minLat)/Math.max(maxLat-minLat,.001))*70}%` });

  return (
    <>
      <PageHeader eyebrow="Saha görünümü" title="Konum ve koordinatlar" description="Yaralı kayıtlarını saha konumları ve ekip atamalarıyla birlikte izleyin." icon={Map}/>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[{label:"Konumlu kayıt",value:mapped.length,icon:LocateFixed,cls:"bg-brand-50 text-brand-700"},{label:"Konum bekleyen",value:patients.length-mapped.length,icon:Crosshair,cls:"bg-amber-50 text-amber-700"},{label:"Aktif saha noktası",value:new Set(patients.map(p=>p.locationDescription)).size,icon:MapPin,cls:"bg-blue-50 text-blue-700"}].map(item=><div key={item.label} className="panel flex items-center gap-4 p-5"><span className={`grid h-11 w-11 place-items-center rounded-xl ${item.cls}`}><item.icon className="h-5 w-5"/></span><div><p className="text-2xl font-black text-slate-900">{item.value}</p><p className="text-[11px] font-semibold text-slate-400">{item.label}</p></div></div>)}
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-sm font-extrabold text-slate-900">Operasyon haritası</h2><p className="mt-0.5 text-[10px] text-slate-400">Koordinat girilen kayıtların şematik gösterimi</p></div><div className="ml-auto flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700"><Satellite className="h-3.5 w-3.5"/>GPS bağlantısı hazır</div></div>
        <div className="relative h-[420px] overflow-hidden bg-[#e9f1ed] grid-surface sm:h-[500px]">
          <div className="absolute left-[18%] top-0 h-full w-16 -rotate-12 bg-white/70 shadow-[0_0_0_1px_rgba(148,163,184,.2)]"/><div className="absolute left-0 top-[62%] h-12 w-full rotate-3 bg-white/70 shadow-[0_0_0_1px_rgba(148,163,184,.2)]"/>
          <div className="absolute left-[48%] top-[17%] h-28 w-40 rounded-xl border border-slate-300/50 bg-slate-200/70 shadow-inner"/><div className="absolute bottom-[14%] right-[10%] h-20 w-32 rounded-xl border border-slate-300/50 bg-slate-200/70 shadow-inner"/>
          <div className="absolute left-4 top-4 rounded-xl border border-white/70 bg-white/90 p-3 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur"><div className="mb-2 flex items-center gap-1.5 font-bold text-slate-700"><Radio className="h-3.5 w-3.5 text-brand-600"/>Canlı saha katmanı</div>{Object.entries(pinColor).map(([risk,color])=><div key={risk} className="mt-1 flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${color}`}/>{risk==='RED'?'Kırmızı':risk==='YELLOW'?'Sarı':risk==='GREEN'?'Yeşil':'Siyah / Gri'}</div>)}</div>
          {mapped.map(patient=><Link href={`/patients/${patient.id}`} key={patient.id} style={position(patient.latitude!,patient.longitude!)} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"><span className={`grid h-9 w-9 place-items-center rounded-full border-4 border-white text-white shadow-lg transition group-hover:scale-110 ${pinColor[patient.riskLevel]}`}><MapPin className="h-4 w-4"/></span><span className="pointer-events-none absolute left-1/2 top-11 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg group-hover:block">{patient.fullName}</span></Link>)}
          {!mapped.length && <div className="absolute inset-0 grid place-items-center text-center"><div><Navigation className="mx-auto h-8 w-8 text-slate-400"/><p className="mt-3 text-sm font-bold text-slate-600">Koordinatlı kayıt bulunmuyor</p></div></div>}
          <div className="absolute bottom-4 right-4 rounded-lg bg-white/90 px-3 py-2 font-mono text-[9px] text-slate-500 shadow-sm">38.4192° N &nbsp; 27.1287° E</div>
        </div>
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><Route className="h-[18px] w-[18px] text-brand-600"/><div><h2 className="text-sm font-extrabold text-slate-900">Konum kayıtları</h2><p className="text-[10px] text-slate-400">Koordinat bulunmayan kayıtlar açıklama bilgisiyle gösterilir</p></div></div>
        <div className="divide-y divide-slate-100">{patients.map(patient=><Link href={`/patients/${patient.id}`} key={patient.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white ${pinColor[patient.riskLevel]}`}><MapPin className="h-4 w-4"/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-xs font-extrabold text-slate-800">{patient.fullName}</p><RiskBadge level={patient.riskLevel} compact/><StatusBadge status={patient.interventionStatus}/></div><p className="mt-1 truncate text-[10px] text-slate-400">{patient.locationDescription} {patient.latitude&&patient.longitude?`• ${patient.latitude.toFixed(4)}, ${patient.longitude.toFixed(4)}`:'• GPS bekleniyor'}</p></div><p className="hidden text-right text-[10px] font-semibold text-slate-400 sm:block">{patient.assignments[0]?.team.name ?? "Ekip atanmadı"}</p><ArrowRight className="h-4 w-4 text-slate-300"/></Link>)}</div>
      </section>
    </>
  );
}
