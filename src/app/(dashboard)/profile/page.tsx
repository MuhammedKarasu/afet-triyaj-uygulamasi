import { Activity, AppWindow, AtSign, BadgeCheck, Info, ShieldCheck, Smartphone, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { requireUser } from "@/lib/auth";
import { ROLES, type UserRole } from "@/lib/constants";
import { initials } from "@/lib/utils";

const roleDescriptions: Record<UserRole, string> = {
  ADMIN: "Tüm operasyon ekranlarına, ekip yönetimine ve müdahale işlemlerine erişebilir.",
  MEDIC: "Triyaj, müdahale güncelleme ve saha ekibi koordinasyonu yapabilir.",
  VOLUNTEER: "Dashboard, yaralı kaydı ve saha bilgilerine kontrollü erişebilir.",
};

export const metadata = { title: "Profil ve Ayarlar" };

export default async function ProfilePage() {
  const user = await requireUser();
  const role = user.role as UserRole;

  return (
    <>
      <PageHeader
        eyebrow="Hesap ve uygulama"
        title="Profil ve ayarlar"
        description="Demo hesabınızı, rol yetkilerinizi ve AfetSaha PWA durumunu görüntüleyin."
        icon={UserCircle}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard title="Kullanıcı bilgileri" description="Aktif demo oturumu" icon={ShieldCheck}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-brand-50 text-2xl font-black text-brand-700 ring-1 ring-brand-100">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" /> Aktif oturum
                </span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><AtSign className="h-4 w-4" />{user.email}</p>
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-600">{ROLES[role]}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{roleDescriptions[role]}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Uygulama durumu" description="V3.4 operasyon deneyimi" icon={AppWindow}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><Smartphone className="h-5 w-5" /></span>
              <div><p className="text-sm font-bold text-slate-800">PWA kullanıma hazır</p><p className="text-[11px] text-slate-500">iPhone safe-area desteği aktif</p></div>
              <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500" aria-label="Aktif" />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Activity className="h-5 w-5" /></span>
              <div><p className="text-sm font-bold text-slate-800">AfetSaha</p><p className="text-[11px] text-slate-500">Sürüm 3.4 • Eğitim modu</p></div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-amber-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-xs leading-5">AfetSaha tıbbi teşhis sistemi değildir. Risk seviyeleri yalnızca eğitim ve karar destek amacıyla sunulur.</p>
      </div>
    </>
  );
}
