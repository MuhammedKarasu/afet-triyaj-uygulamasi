"use client";

import { useState } from "react";
import { Activity, Ambulance, CheckCircle2, Loader2, UserCheck, UserX, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateInterventionAction } from "@/app/actions";
import { STATUS, type InterventionStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const quickStatuses = ["IN_PROGRESS", "TREATED", "TRANSFERRED", "DISCHARGED", "DECEASED"] as const satisfies readonly InterventionStatus[];
type QuickStatus = (typeof quickStatuses)[number];
const icons = { IN_PROGRESS: Activity, TREATED: CheckCircle2, TRANSFERRED: Ambulance, DISCHARGED: UserCheck, DECEASED: UserX };
const tones = {
  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700",
  TREATED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  TRANSFERRED: "border-violet-200 bg-violet-50 text-violet-700",
  DISCHARGED: "border-teal-200 bg-teal-50 text-teal-700",
  DECEASED: "border-slate-300 bg-slate-100 text-slate-700",
};

export function QuickStatusUpdate({ patientId, currentStatus }: { patientId: string; currentStatus: InterventionStatus }) {
  const router = useRouter();
  const [selected, setSelected] = useState<QuickStatus | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleUpdate(formData: FormData) {
    setSaving(true);
    await updateInterventionAction(formData);
    setSaving(false);
    setSelected(null);
    router.refresh();
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {quickStatuses.map((status) => {
          const Icon = icons[status];
          return <button
            key={status}
            type="button"
            disabled={currentStatus === status}
            onClick={() => setSelected(status)}
            className={cn("flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-bold transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-45", tones[status])}
          >
            <Icon className="h-4 w-4 shrink-0" /><span>{STATUS[status]}</span>
          </button>;
        })}
      </div>

      {selected && <div className="fixed inset-0 z-[70] grid items-end bg-slate-950/50 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="quick-status-title">
        <div className="w-full max-w-md rounded-[24px] border border-white/70 bg-white p-5 shadow-2xl sm:p-6">
          <div className="flex items-start gap-3">
            <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl border", tones[selected])}>{(() => { const Icon = icons[selected]; return <Icon className="h-5 w-5" />; })()}</div>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-600">Hızlı işlem</p><h2 id="quick-status-title" className="mt-1 text-lg font-extrabold text-slate-900">{STATUS[selected]}</h2><p className="mt-1 text-xs leading-5 text-slate-500">Kısa bir operasyon notu ekleyerek durumu güncelleyin.</p></div>
            <button type="button" onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500" aria-label="Pencereyi kapat"><X className="h-4 w-4" /></button>
          </div>

          <form action={handleUpdate} className="mt-5 space-y-4">
            <input type="hidden" name="patientId" value={patientId} />
            <input type="hidden" name="status" value={selected} />
            {selected === "TRANSFERRED" && <div><label className="label" htmlFor="quick-destination">Sevk edilen kurum / hastane</label><input id="quick-destination" className="input" name="destination" placeholder="Kurum adı (opsiyonel)" /></div>}
            <div><label className="label" htmlFor="quick-note">Durum notu</label><textarea id="quick-note" className="textarea" name="note" minLength={3} required autoFocus placeholder="Uygulanan işlem ve güncel durum..." /></div>
            <div className="flex gap-2"><button type="button" onClick={() => setSelected(null)} className="btn-secondary flex-1">Vazgeç</button><button className="btn-primary flex-1" disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin" />Kaydediliyor</> : "Durumu kaydet"}</button></div>
          </form>
        </div>
      </div>}
    </>
  );
}
