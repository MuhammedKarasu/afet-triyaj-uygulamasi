"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateInterventionAction } from "@/app/actions";
import { STATUS, type InterventionStatus } from "@/lib/constants";

const noteLabels: Record<InterventionStatus, string> = {
  WAITING: "Genel durum notu",
  IN_PROGRESS: "Müdahale notu",
  TREATED: "Tamamlanan müdahale notu",
  TRANSFERRED: "Sevk notu",
  DISCHARGED: "Taburcu açıklaması",
  DECEASED: "Vefat kayıt notu",
};

const notePlaceholders: Record<InterventionStatus, string> = {
  WAITING: "Bekleme gerekçesi veya güncel gözlem...",
  IN_PROGRESS: "Uygulanan işlem ve güncel bulgular...",
  TREATED: "Tamamlanan müdahale ve sonuç...",
  TRANSFERRED: "Sevk gerekçesi ve teslim bilgileri...",
  DISCHARGED: "Taburcu değerlendirmesi ve öneriler...",
  DECEASED: "Yetkili değerlendirme ve kayıt açıklaması...",
};

export function InterventionUpdateForm({ patientId, currentStatus }: { patientId: string; currentStatus: InterventionStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<InterventionStatus>(currentStatus);
  const isResolved = ["TREATED", "TRANSFERRED", "DISCHARGED", "DECEASED"].includes(status);

  useEffect(() => setStatus(currentStatus), [currentStatus]);

  async function handleUpdate(formData: FormData) {
    await updateInterventionAction(formData);
    router.refresh();
  }

  return (
    <form action={handleUpdate} className="mt-4 space-y-4">
      <input type="hidden" name="patientId" value={patientId} />
      <div>
        <label className="label" htmlFor="intervention-status">Yeni durum</label>
        <select
          id="intervention-status"
          className="input"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as InterventionStatus)}
        >
          {Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {status === "TRANSFERRED" && <div>
        <label className="label" htmlFor="transfer-destination">Sevk edilen kurum / hastane <span className="font-normal text-slate-400">(opsiyonel)</span></label>
        <input id="transfer-destination" className="input" name="destination" placeholder="Örn. Afet Bölge Eğitim ve Araştırma Hastanesi" />
      </div>}

      <div>
        <label className="label" htmlFor="status-note">{noteLabels[status]}</label>
        <textarea id="status-note" className="textarea" name="note" required minLength={3} placeholder={notePlaceholders[status]} />
        <p className="mt-1.5 text-[10px] leading-4 text-slate-400">Durum değişiklikleri kayıt geçmişinde kullanıcı ve zaman bilgisiyle saklanır.</p>
      </div>

      {isResolved && <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[11px] leading-5 text-slate-600">
        Bu durum kaydı aktif listeden çıkarıp Vaka Geçmişi'ne taşır. Kayıt silinmez ve daha sonra yeniden aktif duruma alınabilir.
      </div>}

      <button className="btn-primary w-full"><CheckCircle2 className="h-4 w-4" />Durumu güncelle</button>
    </form>
  );
}
