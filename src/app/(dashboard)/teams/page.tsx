import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Activity, MapPinned, PauseCircle, Plus, ShieldCheck, ToggleLeft, ToggleRight, UserRound, Users } from "lucide-react";
import { createTeamAction, toggleTeamAction, updateTeamStatusAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { RiskBadge } from "@/components/risk-badge";
import { requireUser } from "@/lib/auth";
import { TEAM_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const user = await requireUser(["ADMIN", "MEDIC"]);
  const teams = await prisma.team.findMany({
    include: {
      assignments: {
        include: { patient: { select: { id: true, fullName: true, riskLevel: true, interventionStatus: true } } },
        orderBy: { assignedAt: "desc" },
      },
    },
    orderBy: [{ isActive: "desc" }, { available: "desc" }, { name: "asc" }],
  });

  const isAdmin = user.role === "ADMIN";
  const activeCount = teams.filter((team) => team.isActive).length;
  const availableCount = teams.filter((team) => team.isActive && team.available && team.status === "AVAILABLE").length;
  const onDutyCount = teams.filter((team) => team.status === "ON_DUTY").length;
  const assignedCount = teams.reduce((sum, team) => sum + activeAssignments(team).length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Operasyon kaynakları"
        title="Ekip yönetimi"
        description="Saha ekiplerinin görev bölgelerini, konumlarını, uygunluk durumlarını ve aktif atamalarını yönetin."
        icon={Users}
        actions={<Link href="/map" className="btn-primary"><MapPinned className="h-4 w-4" />Saha Haritası</Link>}
      />

      <section className="mb-5 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Toplam ekip", value: teams.length, icon: Users, cls: "bg-blue-50 text-blue-600" },
          { label: "Aktif ekip", value: activeCount, icon: Activity, cls: "bg-emerald-50 text-emerald-600" },
          { label: "Uygun ekip", value: availableCount, icon: ShieldCheck, cls: "bg-brand-50 text-brand-700" },
          { label: "Görevde ekip", value: onDutyCount || assignedCount, icon: MapPinned, cls: "bg-violet-50 text-violet-600" },
        ].map((item) => (
          <div className="panel flex items-center gap-4 p-5" key={item.label}>
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${item.cls}`}><item.icon className="h-5 w-5" /></span>
            <div><p className="text-2xl font-black text-slate-900">{item.value}</p><p className="text-[11px] font-semibold text-slate-400">{item.label}</p></div>
          </div>
        ))}
      </section>

      <div className={`grid gap-5 ${isAdmin ? "xl:grid-cols-[1fr_360px]" : ""}`}>
        <section className="grid content-start gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const members = team.members.split(",").map((member) => member.trim()).filter(Boolean);
            const currentAssignments = activeAssignments(team);
            return (
              <article className={`panel overflow-hidden ${!team.isActive ? "opacity-70" : ""}`} key={team.id}>
                <div className="flex items-start gap-3 border-b border-slate-100 p-5">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${team.available ? "bg-emerald-50 text-emerald-700" : team.isActive ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                    <Users className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-extrabold text-slate-900">{team.name}</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black ${team.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />{team.isActive ? "AKTİF" : "PASİF"}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-700">{TEAM_STATUS[team.status as keyof typeof TEAM_STATUS] ?? team.status}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><MapPinned className="h-3 w-3" />{team.region}</p>
                  </div>
                  {isAdmin && (
                    <form action={toggleTeamAction}>
                      <input type="hidden" name="id" value={team.id} />
                      <input type="hidden" name="isActive" value={String(team.isActive)} />
                      <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100" title={team.isActive ? "Pasif yap" : "Aktif yap"}>
                        {team.isActive ? <ToggleRight className="h-5 w-5 text-brand-600" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </form>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-px bg-slate-100">
                  <div className="bg-white p-4"><p className="text-xl font-black text-slate-900">{members.length}</p><p className="text-[9px] font-bold uppercase text-slate-400">Personel</p></div>
                  <div className="bg-white p-4"><p className="text-xl font-black text-slate-900">{currentAssignments.length}</p><p className="text-[9px] font-bold uppercase text-slate-400">Aktif görev</p></div>
                  <div className="bg-white p-4"><p className="text-xl font-black text-slate-900">{team.available ? "Var" : "Yok"}</p><p className="text-[9px] font-bold uppercase text-slate-400">Uygunluk</p></div>
                </div>

                <div className="grid gap-4 p-5">
                  <div>
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Ekip üyeleri</p>
                    <div className="flex flex-wrap gap-2">{members.map((member) => <span key={member} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600"><UserRound className="h-3 w-3 text-slate-400" />{member}</span>)}</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Konum bilgisi</p>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-700">{team.latitude && team.longitude ? `${team.latitude.toFixed(5)}, ${team.longitude.toFixed(5)}` : "Koordinat girilmedi"}</p>
                    <Link href={`/map?teamId=${team.id}`} className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50">Haritada göster</Link>
                  </div>

                  {(isAdmin || user.role === "MEDIC") && (
                    <form action={updateTeamStatusAction} className="flex gap-2">
                      <input type="hidden" name="id" value={team.id} />
                      <select name="status" className="input h-10 text-xs" defaultValue={team.status}>{Object.entries(TEAM_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                      <button className="btn-secondary h-10 px-3 text-xs">Güncelle</button>
                    </form>
                  )}
                </div>

                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Güncel atamalar</p>
                  {currentAssignments.length ? (
                    <div className="space-y-2">
                      {currentAssignments.slice(0, 3).map((assignment) => (
                        <Link href={`/patients/${assignment.patient.id}`} key={assignment.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                          <RiskBadge level={assignment.patient.riskLevel} compact />
                          <span className="truncate text-xs font-bold text-slate-700">{assignment.patient.fullName}</span>
                        </Link>
                      ))}
                    </div>
                  ) : <p className="flex items-center gap-2 text-[11px] text-slate-400"><PauseCircle className="h-3.5 w-3.5" />Aktif atama bulunmuyor.</p>}
                </div>
              </article>
            );
          })}
        </section>

        {isAdmin && (
          <aside className="panel h-fit p-5 sm:p-6 xl:sticky xl:top-24">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Plus className="h-[18px] w-[18px]" /></span>
              <div><h2 className="text-sm font-extrabold text-slate-900">Yeni ekip oluştur</h2><p className="text-[10px] text-slate-400">Operasyona saha kaynağı ekleyin</p></div>
            </div>
            <form action={createTeamAction} className="mt-5 space-y-4">
              <div><label className="label">Ekip adı</label><input className="input" name="name" required minLength={3} placeholder="Örn. Delta Sağlık Ekibi" /></div>
              <div><label className="label">Ekip üyeleri</label><textarea className="textarea" name="members" required placeholder="Adları virgülle ayırın" /></div>
              <div><label className="label">Görev bölgesi</label><input className="input" name="region" required placeholder="Örn. E ve F Blokları" /></div>
              <div><label className="label">Ekip durumu</label><select className="input" name="status" defaultValue="AVAILABLE">{Object.entries(TEAM_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Enlem</label><input className="input" name="latitude" type="number" step="any" placeholder="38.4199" /></div>
                <div><label className="label">Boylam</label><input className="input" name="longitude" type="number" step="any" placeholder="27.1279" /></div>
              </div>
              <button className="btn-primary w-full"><Plus className="h-4 w-4" />Ekibi oluştur</button>
            </form>
            <p className="mt-4 text-[10px] leading-5 text-slate-400">Yeni ekipler uygun durumda oluşturulabilir ve vaka detay sayfasından görevlendirilebilir.</p>
          </aside>
        )}
      </div>
    </>
  );
}

type TeamWithAssignments = Prisma.TeamGetPayload<{
  include: {
    assignments: {
      include: { patient: { select: { id: true; fullName: true; riskLevel: true; interventionStatus: true } } };
    };
  };
}>;

function activeAssignments(team: TeamWithAssignments) {
  return team.assignments.filter((assignment) => ["WAITING", "IN_PROGRESS"].includes(assignment.patient.interventionStatus) && !assignment.completedAt);
}
