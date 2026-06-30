import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Brain,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  HeartPulse,
  Info,
  ListTree,
  MapPin,
  Navigation,
  Send,
  Stethoscope,
  User,
  Users,
  Wind,
} from "lucide-react";
import { assignTeamAction, updateAssignmentStatusAction } from "@/app/actions";
import { InterventionUpdateForm } from "@/components/intervention-update-form";
import { PageHeader } from "@/components/page-header";
import { QuickStatusUpdate } from "@/components/quick-status-update";
import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { ASSIGNMENT_STATUS, normalizeInterventionStatus, RISK, TEAM_STATUS, type RiskLevel } from "@/lib/constants";
import { distanceKm, formatDistanceKm, hasCoordinates } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const labels = {
  gender: { FEMALE: "Kadın", MALE: "Erkek", OTHER: "Diğer / Bilinmiyor" },
  respiratoryStatus: { NORMAL: "Normal", DIFFICULT: "Solunum güçlüğü", NONE: "Solunum yok" },
  consciousness: { ALERT: "Açık / Uyanık", CONFUSED: "Bulanık / Konfüze", UNCONSCIOUS: "Kapalı" },
  bleeding: { NONE: "Yok", MODERATE: "Kontrollü", SEVERE: "Şiddetli" },
} as const;

function getLabel(group: keyof typeof labels, value: string) {
  return (labels[group] as Record<string, string>)[value] ?? value;
}

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ yeni?: string; from?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { yeni, from } = await searchParams;

  const [patient, teams] = await Promise.all([
    prisma.patient.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, role: true } },
        interventions: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        caseEvents: { include: { createdBy: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
        assignments: { include: { team: true, assignedBy: { select: { name: true } } }, orderBy: { assignedAt: "desc" } },
      },
    }),
    prisma.team.findMany({
      where: { isActive: true },
      include: { assignments: { where: { completedAt: null }, select: { id: true } } },
      orderBy: [{ available: "desc" }, { name: "asc" }],
    }),
  ]);

  if (!patient) notFound();

  const canIntervene = user.role === "ADMIN" || user.role === "MEDIC";
  const risk = RISK[patient.riskLevel as RiskLevel] ?? RISK.BLACK;
  const currentStatus = normalizeInterventionStatus(patient.interventionStatus);
  const backHref = from === "history" ? "/history" : "/patients";
  const backLabel = from === "history" ? "Geçmişe dön" : "Aktif vakalara dön";
  const patientHasCoordinates = hasCoordinates(patient);
  const patientCoordinates = patientHasCoordinates ? { latitude: patient.latitude, longitude: patient.longitude } : null;
  const availableTeams = teams.filter((team) => team.available && team.status === "AVAILABLE");
  const nearestTeams = patientCoordinates
    ? availableTeams
      .filter((team) => hasCoordinates(team))
      .map((team) => ({ team, distance: distanceKm(patientCoordinates, { latitude: team.latitude, longitude: team.longitude }) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
    : [];

  return (
    <>
      {yeni && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          Yaralı kaydı ve otomatik risk analizi başarıyla tamamlandı.
        </div>
      )}

      <PageHeader
        eyebrow={`Vaka • ${patient.caseCode ?? patient.id.slice(-8).toUpperCase()}`}
        title={patient.fullName}
        description={`${patient.age} yaş • ${getLabel("gender", patient.gender)} • ${patient.locationDescription}`}
        icon={Stethoscope}
        actions={<Link href={backHref} className="btn-secondary"><ArrowLeft className="h-4 w-4" />{backLabel}</Link>}
      />

      <section className={`panel mb-5 overflow-hidden border-l-4 ${patient.riskLevel === "RED" ? "border-l-red-600" : patient.riskLevel === "YELLOW" ? "border-l-amber-500" : patient.riskLevel === "GREEN" ? "border-l-emerald-500" : "border-l-slate-600"}`}>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Risk</span>
              <RiskBadge level={patient.riskLevel} />
              <span className="ml-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Durum</span>
              <StatusBadge status={patient.interventionStatus} />
              <span className="text-xs font-bold text-slate-400">{risk.description}</span>
            </div>
            <h2 className="mt-3 text-sm font-extrabold text-slate-900">Risk analiz gerekçesi</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{patient.riskReason}</p>
            {patient.statusNote && (
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Son durum notu</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{patient.transferDestination ? `${patient.transferDestination} • ` : ""}{patient.statusNote}</p>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Son durum güncellemesi</p>
            <p className="mt-1 text-xs font-bold text-slate-700">{formatDate(patient.lastStatusUpdateAt)}</p>
            <p className="mt-1 text-[10px] text-slate-400">Kayıt: {formatDate(patient.createdAt)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-5">
          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <Activity className="h-[18px] w-[18px] text-red-500" />
              <h2 className="text-sm font-extrabold text-slate-900">Hayati bulgular</h2>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-slate-400">İlk değerlendirme</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
              {[
                { icon: HeartPulse, label: "Nabız", value: `${patient.pulse} /dk`, alert: patient.pulse > 130 },
                { icon: Wind, label: "SpO₂", value: `%${patient.spo2}`, alert: patient.spo2 < 90 },
                { icon: Brain, label: "Bilinç", value: getLabel("consciousness", patient.consciousness), alert: patient.consciousness === "UNCONSCIOUS" },
                { icon: Droplets, label: "Kanama", value: getLabel("bleeding", patient.bleeding), alert: patient.bleeding === "SEVERE" },
              ].map((item) => (
                <div key={item.label} className="bg-white p-5">
                  <div className={`grid h-8 w-8 place-items-center rounded-lg ${item.alert ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}><item.icon className="h-4 w-4" /></div>
                  <p className={`mt-3 text-base font-black ${item.alert ? "text-red-600" : "text-slate-800"}`}>{item.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-3 sm:p-6">
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Solunum</p><p className="mt-1 text-sm font-semibold text-slate-700">{getLabel("respiratoryStatus", patient.respiratoryStatus)}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Hareket</p><p className="mt-1 text-sm font-semibold text-slate-700">{patient.canWalk ? "Yürüyebiliyor" : "Yürüyemiyor"}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Yaşam belirtisi</p><p className="mt-1 text-sm font-semibold text-slate-700">{patient.hasLifeSigns ? "Var" : "Yok"}</p></div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <User className="h-[18px] w-[18px] text-blue-500" />
              <h2 className="text-sm font-extrabold text-slate-900">Kişi ve konum bilgileri</h2>
              <Link href={`/map?patientId=${patient.id}`} className="ml-auto text-[11px] font-bold text-brand-700">Haritada Göster</Link>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Kimlik bilgisi</p><p className="mt-1 text-sm font-semibold text-slate-700">{patient.identityNumber || "Bilgi girilmedi"}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Kayıt sorumlusu</p><p className="mt-1 text-sm font-semibold text-slate-700">{patient.createdBy.name}</p></div>
              <div className="sm:col-span-2"><p className="text-[10px] font-bold uppercase text-slate-400">Konum açıklaması</p><p className="mt-1 flex items-start gap-1.5 text-sm font-semibold text-slate-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{patient.locationDescription}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">GPS koordinatı</p><p className="mt-1 font-mono text-xs font-semibold text-slate-700">{patientHasCoordinates ? `${patient.latitude?.toFixed(5)}, ${patient.longitude?.toFixed(5)}` : "Bu vaka için konum bilgisi eklenmemiş."}</p></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Saha notu</p><p className="mt-1 text-sm leading-5 text-slate-600">{patient.notes || "Ek not bulunmuyor."}</p></div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <ListTree className="h-[18px] w-[18px] text-brand-600" />
              <h2 className="text-sm font-extrabold text-slate-900">Süreç geçmişi</h2>
              <span className="ml-auto rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700">{patient.caseEvents.length} olay</span>
            </div>
            {patient.caseEvents.length ? (
              <div className="p-5 sm:p-6">
                {patient.caseEvents.map((event, index) => (
                  <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                    <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-[3px] border-white bg-brand-500 ring-2 ring-brand-100" />
                    {index < patient.caseEvents.length - 1 && <span className="absolute bottom-0 left-[5px] top-4 w-px bg-slate-200" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-bold text-slate-800">{event.title}</h3><span className="text-[10px] text-slate-400">{formatDate(event.createdAt)}</span></div>
                      {event.description && <p className="mt-1 text-xs leading-5 text-slate-500">{event.description}</p>}
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">{event.createdBy.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="p-6 text-sm text-slate-500">Henüz süreç olayı bulunmuyor.</p>}
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <CalendarClock className="h-[18px] w-[18px] text-violet-500" />
              <h2 className="text-sm font-extrabold text-slate-900">Müdahale geçmişi</h2>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{patient.interventions.length} işlem</span>
            </div>
            {patient.interventions.length ? (
              <div className="divide-y divide-slate-100">
                {patient.interventions.map((item) => (
                  <div key={item.id} className="flex gap-3 p-5 sm:px-6">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600"><ClipboardCheck className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.status} /><span className="text-[10px] text-slate-400">{formatDate(item.createdAt)}</span></div>
                      {item.destination && <p className="mt-2 text-xs font-bold text-violet-700">Sevk kurumu: {item.destination}</p>}
                      <p className="mt-1.5 text-sm text-slate-600">{item.note || "Durum güncellendi."}</p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.author.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="p-8 text-center"><p className="text-sm font-semibold text-slate-500">Henüz müdahale kaydı yok.</p><p className="mt-1 text-xs text-slate-400">İlk durum güncellemesi burada görünecek.</p></div>}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="panel p-5 sm:p-6">
            <div className="flex items-center gap-2"><ClipboardCheck className="h-[18px] w-[18px] text-brand-600" /><h2 className="text-sm font-extrabold text-slate-900">Müdahale güncelle</h2></div>
            {canIntervene ? (
              <>
                <QuickStatusUpdate patientId={patient.id} currentStatus={currentStatus} />
                <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-slate-100" /><span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Ayrıntılı güncelleme</span><span className="h-px flex-1 bg-slate-100" /></div>
                <InterventionUpdateForm key={currentStatus} patientId={patient.id} currentStatus={currentStatus} />
              </>
            ) : <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800"><Info className="mb-2 h-4 w-4" />Müdahale durumu yalnızca sağlık personeli veya admin tarafından değiştirilebilir.</div>}
          </section>

          <section id="assign-team" className="panel p-5 sm:p-6">
            <div className="flex items-center gap-2"><Users className="h-[18px] w-[18px] text-blue-600" /><h2 className="text-sm font-extrabold text-slate-900">Saha ekibi</h2></div>
            {patient.assignments.length ? (
              <div className="mt-4 space-y-3">
                {patient.assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{assignment.team.name}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{assignment.team.region} • {formatDate(assignment.assignedAt)}</p>
                        <p className="mt-1 text-[10px] font-bold text-blue-700">{ASSIGNMENT_STATUS[assignment.status as keyof typeof ASSIGNMENT_STATUS] ?? assignment.status}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-slate-500 ring-1 ring-slate-200">{TEAM_STATUS[assignment.team.status as keyof typeof TEAM_STATUS] ?? assignment.team.status}</span>
                    </div>
                    {assignment.note && <p className="mt-2 text-[11px] leading-5 text-slate-500">{assignment.note}</p>}
                    {assignment.assignedBy?.name && <p className="mt-1 text-[10px] font-semibold text-slate-400">Atayan: {assignment.assignedBy.name}</p>}
                    {canIntervene && (
                      <form action={updateAssignmentStatusAction} className="mt-3 space-y-2">
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                        <select name="status" className="input h-10 text-xs" defaultValue={assignment.status}>{Object.entries(ASSIGNMENT_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                        <input name="note" className="input h-10 text-xs" placeholder="Atama durum notu" defaultValue={assignment.note ?? ""} />
                        <button className="btn-secondary h-10 w-full text-xs">Atama durumunu güncelle</button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-xs leading-5 text-slate-400">Bu yaralıya henüz ekip atanmadı.</p>}

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-extrabold text-blue-900">En yakın uygun ekip önerileri</p>
              {!patientHasCoordinates && <p className="mt-2 text-xs leading-5 text-blue-800/80">Bu vaka için konum bilgisi eklenmemiş.</p>}
              {patientHasCoordinates && !nearestTeams.length && <p className="mt-2 text-xs leading-5 text-blue-800/80">Şu anda uygun ekip bulunmuyor.</p>}
              {nearestTeams.length ? (
                <div className="mt-3 space-y-2">
                  {nearestTeams.map(({ team, distance }) => (
                    <div key={team.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs">
                      <span className="min-w-0 flex-1 font-bold text-slate-800">{team.name}</span>
                      <span className="font-mono text-[10px] font-bold text-blue-700">{formatDistanceKm(distance)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 text-[10px] leading-4 text-blue-800/60">Mesafe tahmini koordinatlara göre hesaplanır.</p>
            </div>

            {canIntervene && (
              <form action={assignTeamAction} className="mt-4 space-y-3">
                <input type="hidden" name="patientId" value={patient.id} />
                <label className="label">Aktif ekip ata</label>
                <select name="teamId" className="input" required defaultValue="">
                  <option value="" disabled>{availableTeams.length ? "Uygun ekip seçin" : "Şu anda uygun ekip bulunmuyor"}</option>
                  {availableTeams.map((team) => <option key={team.id} value={team.id}>{team.name} • {team.region} • {team.assignments.length} aktif görev</option>)}
                </select>
                <textarea name="note" className="textarea min-h-20" placeholder="Atama notu: ekip neden yönlendiriliyor, erişim bilgisi, güvenlik uyarısı..." />
                <button className="btn-primary w-full" disabled={!availableTeams.length}><Send className="h-4 w-4" />Ekibi vakaya ata</button>
              </form>
            )}
          </section>

          <section className="panel overflow-hidden">
            <div className="grid-surface grid h-36 place-items-center bg-slate-100">
              <span className="grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-brand-600 text-white shadow-lg"><MapPin className="h-5 w-5" /></span>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <div><p className="text-xs font-bold text-slate-800">Saha konumu</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{patientHasCoordinates ? patient.locationDescription : "Bu vaka için konum bilgisi eklenmemiş."}</p></div>
              </div>
              <Link href={`/map?patientId=${patient.id}`} className="btn-secondary mt-4 w-full">Haritada Göster</Link>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
