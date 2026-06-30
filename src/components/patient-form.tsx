"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Activity, AlertCircle, ArrowRight, Brain, Check, Droplets, HeartPulse, Loader2, LocateFixed, MapPin, Navigation, ShieldAlert, UserRound, Wind } from "lucide-react";
import { patientSchema, type PatientFormValues } from "@/lib/validations";
import { calculateRisk } from "@/lib/risk";
import { RISK } from "@/lib/constants";
import { RiskBadge } from "@/components/risk-badge";
import { FormSection } from "@/components/form-section";
import { cn } from "@/lib/utils";

const errorClass = "mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600";

export function PatientForm({ recorderName }: { recorderName: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "", age: 35, gender: "MALE", identityNumber: "", pulse: 80, spo2: 98,
      respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE",
      canWalk: true, hasLifeSigns: true, locationDescription: "", notes: "",
    },
  });
  const values = watch();
  const preview = useMemo(() => calculateRisk({
    pulse: Number.isFinite(values.pulse) ? values.pulse : 0,
    spo2: Number.isFinite(values.spo2) ? values.spo2 : 0,
    respiratoryStatus: values.respiratoryStatus ?? "NORMAL",
    consciousness: values.consciousness ?? "ALERT",
    bleeding: values.bleeding ?? "NONE",
    canWalk: values.canWalk ?? true,
    hasLifeSigns: values.hasLifeSigns ?? true,
  }), [values.pulse, values.spo2, values.respiratoryStatus, values.consciousness, values.bleeding, values.canWalk, values.hasLifeSigns]);

  async function onSubmit(data: PatientFormValues) {
    setSaving(true); setServerError("");
    try {
      const response = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push(`/patients/${result.id}?yeni=1`);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Kayıt tamamlanamadı.");
      setSaving(false);
    }
  }

  function handleUseCurrentLocation() {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Konum alınamadı. Lütfen manuel konum girin.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", Number(position.coords.latitude.toFixed(6)), { shouldValidate: true, shouldDirty: true });
        setValue("longitude", Number(position.coords.longitude.toFixed(6)), { shouldValidate: true, shouldDirty: true });
        setLocationMessage("Mevcut konum koordinatlara eklendi.");
        setLocationLoading(false);
      },
      (error) => {
        setLocationMessage(error.code === error.PERMISSION_DENIED ? "Konum izni verilmedi. Manuel konum girebilirsiniz." : "Konum alınamadı. Lütfen manuel konum girin.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  const riskTone = preview.level === "RED" ? "border-red-200 bg-red-50/70" : preview.level === "YELLOW" ? "border-amber-200 bg-amber-50/70" : preview.level === "GREEN" ? "border-emerald-200 bg-emerald-50/70" : "border-slate-300 bg-slate-100";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection step={1} title="Kişisel bilgiler" description="Yaralının bilinen kimlik ve kayıt bilgileri" icon={UserRound}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2"><label className="label" htmlFor="fullName">Ad Soyad <b className="text-red-500">*</b></label><input id="fullName" className="input" placeholder="Örn. Ayşe Yılmaz" {...register("fullName")}/>{errors.fullName && <p className={errorClass}><AlertCircle className="h-3 w-3"/>{errors.fullName.message}</p>}</div>
          <div><label className="label" htmlFor="age">Yaş <b className="text-red-500">*</b></label><input id="age" className="input" type="number" {...register("age", { valueAsNumber: true })}/>{errors.age && <p className={errorClass}>{errors.age.message}</p>}</div>
          <div><label className="label" htmlFor="gender">Cinsiyet <b className="text-red-500">*</b></label><select id="gender" className="input" {...register("gender")}><option value="FEMALE">Kadın</option><option value="MALE">Erkek</option><option value="OTHER">Diğer / Bilinmiyor</option></select></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="identityNumber">Kimlik bilgisi <span className="font-normal text-slate-400">(opsiyonel)</span></label><input id="identityNumber" className="input" placeholder="T.C. kimlik / geçici kayıt kodu" {...register("identityNumber")}/></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="recorderName">Kaydı yapan personel</label><input id="recorderName" className="input" value={recorderName} disabled/></div>
        </div>
      </FormSection>

      <FormSection step={2} title="Hayati bulgular" description="Otomatik risk analizinde kullanılacak saha ölçümleri" icon={Activity}>
        <div className="grid gap-5 sm:grid-cols-3">
            <div><label className="label flex items-center gap-1.5" htmlFor="pulse"><HeartPulse className="h-3.5 w-3.5 text-red-500"/>Nabız (atım/dk)</label><input id="pulse" className="input" type="number" {...register("pulse", { valueAsNumber: true })}/>{errors.pulse && <p className={errorClass}>{errors.pulse.message}</p>}</div>
            <div><label className="label flex items-center gap-1.5" htmlFor="spo2"><Wind className="h-3.5 w-3.5 text-blue-500"/>SpO₂ (%)</label><input id="spo2" className="input" type="number" {...register("spo2", { valueAsNumber: true })}/>{errors.spo2 && <p className={errorClass}>{errors.spo2.message}</p>}</div>
            <div><label className="label" htmlFor="respiratoryStatus">Solunum durumu</label><select id="respiratoryStatus" className="input" {...register("respiratoryStatus")}><option value="NORMAL">Normal</option><option value="DIFFICULT">Solunum güçlüğü</option><option value="NONE">Solunum yok</option></select></div>
        </div>
      </FormSection>

      <FormSection step={3} title="Durum bilgileri" description="Bilinç, kanama, hareket ve yaşam belirtisi değerlendirmesi" icon={Brain}>
        <label className={cn("mb-5 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition", values.hasLifeSigns ? "border-slate-200 bg-slate-50/70" : "border-slate-500 bg-slate-100")}>
          <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={!values.hasLifeSigns} onChange={(event) => setValue("hasLifeSigns", !event.target.checked, { shouldValidate: true })}/>
          <ShieldAlert className="h-5 w-5 shrink-0 text-slate-600"/><span><span className="block text-sm font-bold text-slate-800">Yaşam belirtisi yok</span><span className="block text-xs text-slate-500">İşaretlendiğinde sistem siyah/gri triyaj atar.</span></span>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label flex items-center gap-1.5" htmlFor="consciousness"><Brain className="h-3.5 w-3.5 text-violet-500"/>Bilinç durumu</label><select id="consciousness" className="input" {...register("consciousness")}><option value="ALERT">Açık / Uyanık</option><option value="CONFUSED">Bulanık / Konfüze</option><option value="UNCONSCIOUS">Kapalı</option></select></div>
          <div><label className="label">Hareket durumu</label><div className="grid grid-cols-2 gap-2">{[[true,"Yürüyebiliyor"],[false,"Yürüyemiyor"]].map(([value,label])=><button key={String(value)} type="button" onClick={()=>setValue("canWalk", value as boolean, {shouldValidate:true})} className={cn("rounded-xl border px-3 py-3 text-xs font-bold transition", values.canWalk===value?"border-brand-300 bg-brand-50 text-brand-700":"border-slate-200 text-slate-500 hover:bg-slate-50")}>{values.canWalk===value && <Check className="mr-1 inline h-3.5 w-3.5"/>}{label as string}</button>)}</div></div>
          <div className="sm:col-span-2"><label className="label flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-red-500"/>Kanama durumu</label><div className="grid grid-cols-3 gap-2">{[["NONE","Yok"],["MODERATE","Kontrollü"],["SEVERE","Şiddetli"]].map(([value,label])=><label key={value} className={cn("flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-xs font-bold transition", values.bleeding===value ? value==="SEVERE"?"border-red-300 bg-red-50 text-red-700":"border-brand-300 bg-brand-50 text-brand-700":"border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}><input type="radio" value={value} className="sr-only" {...register("bleeding")}/>{values.bleeding===value && <Check className="mr-1 h-3.5 w-3.5"/>}{label}</label>)}</div></div>
        </div>
      </FormSection>

      <FormSection step={4} title="Konum ve saha notları" description="Ekibin yaralıya ulaşmasını kolaylaştıracak bilgiler" icon={MapPin}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-4"><label className="label" htmlFor="locationDescription">Konum açıklaması <b className="text-red-500">*</b></label><input id="locationDescription" className="input" placeholder="Örn. A Blok kuzey cephesi, merdiven girişi" {...register("locationDescription")}/>{errors.locationDescription && <p className={errorClass}><AlertCircle className="h-3 w-3"/>{errors.locationDescription.message}</p>}</div>
          <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-slate-800">Koordinat bilgisi</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">İzin verilirse cihazın mevcut konumu alınır; izin verilmezse enlem/boylam manuel girilebilir.</p>
              </div>
              <button type="button" onClick={handleUseCurrentLocation} disabled={locationLoading} className="btn-secondary h-11 shrink-0">
                {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                Mevcut konumu al
              </button>
            </div>
            {locationMessage && <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${locationMessage.includes("alınamadı") || locationMessage.includes("verilmedi") ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{locationMessage}</p>}
          </div>
          <div className="sm:col-span-1 lg:col-span-2"><label className="label" htmlFor="latitude">GPS enlem <span className="font-normal text-slate-400">(opsiyonel)</span></label><div className="relative"><Navigation className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400"/><input id="latitude" className="input pl-9" type="number" step="any" placeholder="38.4192" {...register("latitude")}/></div>{errors.latitude && <p className={errorClass}>{errors.latitude.message}</p>}</div>
          <div className="sm:col-span-1 lg:col-span-2"><label className="label" htmlFor="longitude">GPS boylam <span className="font-normal text-slate-400">(opsiyonel)</span></label><div className="relative"><Navigation className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400"/><input id="longitude" className="input pl-9" type="number" step="any" placeholder="27.1287" {...register("longitude")}/></div>{errors.longitude && <p className={errorClass}>{errors.longitude.message}</p>}</div>
          <div className="sm:col-span-2 lg:col-span-4"><label className="label" htmlFor="notes">Saha notu</label><textarea id="notes" className="textarea" placeholder="Gözlemler, yaralanma tipi, uygulanan ilk yardım..." {...register("notes")}/>{errors.notes && <p className={errorClass}>{errors.notes.message}</p>}</div>
        </div>
      </FormSection>

      <section aria-live="polite" className={cn("rounded-2xl border p-5 sm:p-6", riskTone)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/80 shadow-sm"><Activity className="h-5 w-5 text-slate-700"/></div>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Canlı risk önizlemesi</p><RiskBadge level={preview.level}/></div><p className="mt-1.5 text-sm font-medium leading-5 text-slate-700">{preview.reason}</p></div>
          <div className="text-right"><p className="text-[10px] font-bold uppercase text-slate-400">Müdahale düzeyi</p><p className="mt-1 text-sm font-extrabold text-slate-800">{RISK[preview.level].description}</p></div>
        </div>
      </section>

      {serverError && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><AlertCircle className="h-4 w-4"/>{serverError}</div>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xl text-[10px] leading-5 text-slate-400">Kaydettiğiniz veriler eğitim amaçlı karar destek algoritması tarafından analiz edilir. Sistem çıktısı tıbbi teşhis değildir.</p><button className="btn-primary min-w-56" type="submit" disabled={saving}>{saving?<><Loader2 className="h-4 w-4 animate-spin"/>Kayıt oluşturuluyor...</>:<>Risk Analizi Yap ve Kaydet <ArrowRight className="h-4 w-4"/></>}</button></div>
    </form>
  );
}
