"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity, Ambulance, ChevronRight, ClipboardPlus, HeartPulse,
  LayoutDashboard, MapPinned, Menu, RadioTower, ShieldCheck, Sparkles, Users, X,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { ROLES, type UserRole } from "@/lib/constants";

const groups = [
  {
    label: "Operasyon",
    items: [
      { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard, roles: ["ADMIN", "MEDIC", "VOLUNTEER"] },
      { href: "/patients", label: "Yaralı Kayıtları", icon: HeartPulse, roles: ["ADMIN", "MEDIC", "VOLUNTEER"] },
      { href: "/patients/new", label: "Yeni Triyaj", icon: ClipboardPlus, roles: ["ADMIN", "MEDIC", "VOLUNTEER"], primary: true },
    ],
  },
  {
    label: "Koordinasyon",
    items: [
      { href: "/teams", label: "Ekip Yönetimi", icon: Users, roles: ["ADMIN", "MEDIC"] },
      { href: "/locations", label: "Saha Konumları", icon: MapPinned, roles: ["ADMIN", "MEDIC", "VOLUNTEER"] },
    ],
  },
];

type SidebarProps = { user: { name: string; email: string; role: string } };

function SidebarContent({ user, close }: SidebarProps & { close?: () => void }) {
  const pathname = usePathname();
  const role = user.role as UserRole;
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#102a2f] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/[.08] px-5">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 ring-1 ring-white/10">
          <Activity className="h-6 w-6" strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-[17px] font-extrabold tracking-[.02em]">AfetSaha</div>
          <div className="text-[8px] font-semibold tracking-[.12em] text-emerald-100/50">ACİL DURUM VE SAHA YÖNETİMİ</div>
        </div>
      </div>

      <div className="mx-4 mt-5 rounded-xl border border-white/[.08] bg-white/[.045] p-3.5">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-50/90">
          <span className="pulse-dot ml-1 h-2 w-2 rounded-full bg-emerald-400 text-emerald-400" />
          <span>Operasyon aktif</span>
          <RadioTower className="ml-auto h-4 w-4 text-emerald-300/70" />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/[.06] pt-2.5">
          <span className="font-mono text-[9px] tracking-wide text-white/35">MERKEZ • AFET-01</span>
          <span className="rounded-md bg-amber-300/10 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-amber-200/70">TATBİKAT</span>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(role));
          if (!visibleItems.length) return null;
          return <div key={group.label}>
            <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[.2em] text-white/28">{group.label}</p>
            <div className="space-y-1">
              {visibleItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={close}
                    className={cn(
                      "group relative flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-semibold transition duration-200",
                      active ? "bg-brand-600 text-white ring-1 ring-white/10" : "text-white/58 hover:bg-white/[.06] hover:text-white",
                      item.primary && !active && "border border-emerald-300/10 bg-emerald-300/[.035] text-emerald-100/75"
                    )}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-white/80" />}
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                    {item.primary && !active && <Sparkles className="ml-auto h-3.5 w-3.5 text-emerald-300/50" />}
                    {active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>;
        })}
      </nav>

      <div className="mx-3 mb-2 flex items-start gap-2.5 rounded-xl border border-white/[.07] bg-black/10 px-3 py-2.5">
        <Ambulance className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200/50" />
        <p className="text-[9px] leading-4 text-white/30">Eğitim modu aktiftir. Sistem çıktıları tıbbi teşhis değildir.</p>
      </div>
      <div className="mx-3 mb-3 rounded-xl border border-white/[.09] bg-white/[.05] p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50/10 text-sm font-extrabold text-emerald-100 ring-1 ring-emerald-200/10">{initials(user.name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-white/45">{ROLES[role]}</p>
          </div>
          <ShieldCheck className="h-4 w-4 text-emerald-300/70" />
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><SidebarContent user={user} /></aside>
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden" aria-label="Menüyü aç">
        <Menu className="h-5 w-5" />
      </button>
      {open && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        <button onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white" aria-label="Menüyü kapat"><X className="h-5 w-5" /></button>
        <SidebarContent user={user} close={() => setOpen(false)} />
      </aside>
    </>
  );
}
