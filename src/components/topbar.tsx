import { Bell, ChevronDown, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { initials } from "@/lib/utils";
import { ROLES, type UserRole } from "@/lib/constants";

export function Topbar({ user }: { user: { name: string; role: string } }) {
  const today = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
      <div className="ml-14 lg:ml-0">
        <p className="text-xs font-medium capitalize text-slate-400">{today}</p>
        <p className="mt-0.5 hidden text-sm font-semibold text-slate-700 sm:block">AfetSaha Operasyon Merkezi</p>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50" aria-label="Bildirimler">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 sm:min-w-44">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-xs font-extrabold text-brand-700">{initials(user.name)}</div>
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-xs font-bold text-slate-800">{user.name}</p>
            <p className="text-[10px] text-slate-400">{ROLES[user.role as UserRole]}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </div>
        <form action={logoutAction}>
          <button className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Çıkış yap" aria-label="Çıkış yap"><LogOut className="h-[18px] w-[18px]" /></button>
        </form>
      </div>
    </header>
  );
}
