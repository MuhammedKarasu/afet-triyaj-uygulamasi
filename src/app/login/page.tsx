import { Activity, ArrowRight, CheckCircle2, HeartPulse, LockKeyhole, Radio, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

const demos = [
  { role: "Admin", email: "admin@afet.local", password: "Admin123!", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-700" },
  { role: "Sağlık Personeli", email: "saglik@afet.local", password: "Saglik123!", icon: HeartPulse, color: "bg-red-50 text-red-600" },
  { role: "Gönüllü", email: "gonullu@afet.local", password: "Gonullu123!", icon: Users, color: "bg-blue-50 text-blue-600" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { hata } = await searchParams;

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.04fr_.96fr]">
      <section className="relative hidden overflow-hidden bg-[#10282d] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="grid-surface absolute inset-0 opacity-40" />
        <div className="absolute -right-36 -top-36 h-[430px] w-[430px] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-44 -left-40 h-[480px] w-[480px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 shadow-xl shadow-black/20"><Activity className="h-7 w-7" /></div>
          <div><p className="text-xl font-black tracking-tight">AfetSaha</p><p className="text-[9px] font-semibold tracking-[.14em] text-emerald-100/50">ACİL DURUM VE SAHA YÖNETİMİ</p></div>
        </div>

        <div className="relative z-10 my-auto max-w-xl py-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[.08] px-3 py-1.5 text-xs font-semibold text-emerald-100/80">
            <Radio className="h-3.5 w-3.5" /> Operasyon merkezi bağlantısı aktif
          </div>
          <h1 className="text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">Doğru öncelik,<br/><span className="text-emerald-300">doğru müdahale.</span></h1>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/55">Afet sonrası yaralı kayıtlarını, otomatik triyaj analizini ve saha ekiplerini tek bir operasyon ekranından yönetin.</p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[['< 30 sn', 'Hızlı kayıt'], ['4 seviye', 'Akıllı triyaj'], ['7/24', 'Saha görünümü']].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[.055] px-4 py-4 backdrop-blur-sm"><p className="text-lg font-extrabold text-emerald-200">{value}</p><p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/40">{label}</p></div>
            ))}
          </div>
        </div>
        <p className="relative z-10 flex items-center gap-2 text-[11px] text-white/30"><CheckCircle2 className="h-4 w-4 text-emerald-300/60" /> Eğitim ve karar destek amaçlı demo sistemidir.</p>
      </section>

      <section className="flex items-center justify-center bg-slate-50/60 px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white"><Activity className="h-6 w-6" /></div><div><p className="font-black tracking-tight">AfetSaha</p><p className="text-[8px] tracking-[.12em] text-slate-400">ACİL DURUM VE SAHA YÖNETİMİ</p></div></div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-600">Güvenli erişim</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Operasyon paneline giriş</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Yetkinize göre kişiselleştirilmiş saha ekranına erişin.</p>

          {hata && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{hata}</div>}

          <form action={loginAction} className="mt-7 space-y-4">
            <div><label className="label" htmlFor="email">E-posta adresi</label><input className="input" id="email" name="email" type="email" defaultValue="admin@afet.local" required /></div>
            <div><div className="mb-1.5 flex items-center justify-between"><label className="text-sm font-semibold text-slate-700" htmlFor="password">Parola</label><span className="text-[11px] font-medium text-slate-400">Demo erişimi</span></div><input className="input" id="password" name="password" type="password" defaultValue="Admin123!" required /></div>
            <button className="btn-primary w-full" type="submit"><LockKeyhole className="h-4 w-4" /> Güvenli giriş yap <ArrowRight className="ml-auto h-4 w-4" /></button>
          </form>

          <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200"/><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hızlı demo hesapları</span><div className="h-px flex-1 bg-slate-200"/></div>
          <div className="grid gap-2.5">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <form action={loginAction} key={demo.email}>
                  <input type="hidden" name="email" value={demo.email}/><input type="hidden" name="password" value={demo.password}/>
                  <button className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md" type="submit">
                    <span className={`grid h-9 w-9 place-items-center rounded-lg ${demo.color}`}><Icon className="h-[18px] w-[18px]" /></span>
                    <span><span className="block text-xs font-bold text-slate-800">{demo.role}</span><span className="block text-[10px] text-slate-400">{demo.email}</span></span>
                    <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </button>
                </form>
              );
            })}
          </div>
          <p className="mt-8 text-center text-[10px] leading-5 text-slate-400">Bu sistem tıbbi teşhis yerine geçmez. Yalnızca eğitim ve karar destek amacıyla geliştirilmiştir.</p>
        </div>
      </section>
    </main>
  );
}
