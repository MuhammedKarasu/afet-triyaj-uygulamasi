import { Activity, MapPinned, PauseCircle, Plus, ShieldCheck, ToggleLeft, ToggleRight, UserRound, Users } from "lucide-react";
import { createTeamAction, toggleTeamAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { RiskBadge } from "@/components/risk-badge";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const user = await requireUser(["ADMIN", "MEDIC"]);
  const teams = await prisma.team.findMany({ include: { assignments: { include: { patient: { select: { id: true, fullName: true, riskLevel: true, interventionStatus: true } } }, orderBy: { assignedAt: "desc" } } }, orderBy: [{ isActive: "desc" }, { name: "asc" }] });
  const activeCount = teams.filter(t => t.isActive).length;
  const assignedCount = teams.reduce((sum,t) => sum + t.assignments.filter(a => !["COMPLETED","TRANSFERRED"].includes(a.patient.interventionStatus)).length, 0);
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <PageHeader eyebrow="Operasyon kaynakları" title="Ekip yönetimi" description="Saha ekiplerinin görev bölgelerini, durumlarını ve aktif atamalarını yönetin." icon={Users}/>
      <section className="mb-5 grid gap-4 sm:grid-cols-3">
        {[{label:"Toplam ekip",value:teams.length,icon:Users,cls:"bg-blue-50 text-blue-600"},{label:"Aktif ekip",value:activeCount,icon:Activity,cls:"bg-emerald-50 text-emerald-600"},{label:"Aktif atama",value:assignedCount,icon:ShieldCheck,cls:"bg-violet-50 text-violet-600"}].map(item=><div className="panel flex items-center gap-4 p-5" key={item.label}><span className={`grid h-11 w-11 place-items-center rounded-xl ${item.cls}`}><item.icon className="h-5 w-5"/></span><div><p className="text-2xl font-black text-slate-900">{item.value}</p><p className="text-[11px] font-semibold text-slate-400">{item.label}</p></div></div>)}
      </section>

      <div className={`grid gap-5 ${isAdmin ? 'xl:grid-cols-[1fr_340px]' : ''}`}>
        <section className="grid content-start gap-4 md:grid-cols-2">
          {teams.map(team => {
            const members = team.members.split(",").map(m=>m.trim());
            const activeAssignments = team.assignments.filter(a=>!["COMPLETED","TRANSFERRED"].includes(a.patient.interventionStatus));
            return <article className={`panel overflow-hidden ${!team.isActive?'opacity-70':''}`} key={team.id}>
              <div className="flex items-start gap-3 border-b border-slate-100 p-5"><span className={`grid h-11 w-11 place-items-center rounded-xl ${team.isActive?'bg-brand-50 text-brand-700':'bg-slate-100 text-slate-500'}`}><Users className="h-5 w-5"/></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-sm font-extrabold text-slate-900">{team.name}</h2><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black ${team.isActive?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{team.isActive?'AKTİF':'PASİF'}</span></div><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><MapPinned className="h-3 w-3"/>{team.region}</p></div>{isAdmin && <form action={toggleTeamAction}><input type="hidden" name="id" value={team.id}/><input type="hidden" name="isActive" value={String(team.isActive)}/><button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100" title={team.isActive?'Pasif yap':'Aktif yap'}>{team.isActive?<ToggleRight className="h-5 w-5 text-brand-600"/>:<ToggleLeft className="h-5 w-5"/>}</button></form>}</div>
              <div className="grid grid-cols-2 gap-px bg-slate-100"><div className="bg-white p-4"><p className="text-xl font-black text-slate-900">{members.length}</p><p className="text-[9px] font-bold uppercase text-slate-400">Ekip personeli</p></div><div className="bg-white p-4"><p className="text-xl font-black text-slate-900">{activeAssignments.length}</p><p className="text-[9px] font-bold uppercase text-slate-400">Aktif yaralı ataması</p></div></div>
              <div className="p-5"><p className="mb-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Ekip üyeleri</p><div className="flex flex-wrap gap-2">{members.map(member=><span key={member} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600"><UserRound className="h-3 w-3 text-slate-400"/>{member}</span>)}</div></div>
              <div className="border-t border-slate-100 px-5 py-4"><p className="mb-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Güncel atamalar</p>{activeAssignments.length?<div className="space-y-2">{activeAssignments.slice(0,3).map(a=><a href={`/patients/${a.patient.id}`} key={a.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"><RiskBadge level={a.patient.riskLevel} compact/><span className="truncate text-xs font-bold text-slate-700">{a.patient.fullName}</span></a>)}</div>:<p className="flex items-center gap-2 text-[11px] text-slate-400"><PauseCircle className="h-3.5 w-3.5"/>Aktif atama bulunmuyor.</p>}</div>
            </article>;
          })}
        </section>

        {isAdmin && <aside className="panel h-fit p-5 sm:p-6 xl:sticky xl:top-24"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Plus className="h-[18px] w-[18px]"/></span><div><h2 className="text-sm font-extrabold text-slate-900">Yeni ekip oluştur</h2><p className="text-[10px] text-slate-400">Operasyona saha kaynağı ekleyin</p></div></div><form action={createTeamAction} className="mt-5 space-y-4"><div><label className="label">Ekip adı</label><input className="input" name="name" required minLength={3} placeholder="Örn. Delta Sağlık Ekibi"/></div><div><label className="label">Ekip üyeleri</label><textarea className="textarea" name="members" required placeholder="Adları virgülle ayırın"/></div><div><label className="label">Görev bölgesi</label><input className="input" name="region" required placeholder="Örn. E ve F Blokları"/></div><button className="btn-primary w-full"><Plus className="h-4 w-4"/>Ekibi oluştur</button></form><p className="mt-4 text-[10px] leading-5 text-slate-400">Yeni ekipler aktif durumda oluşturulur ve yaralı detay sayfasından görevlendirilebilir.</p></aside>}
      </div>
    </>
  );
}

