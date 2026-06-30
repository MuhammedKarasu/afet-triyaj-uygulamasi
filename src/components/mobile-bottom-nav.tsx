"use client";

import type { LucideIcon } from "lucide-react";
import { HeartPulse, History, Home, MapPinned, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: (pathname: string) => boolean;
};

const mainItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Ana Sayfa",
    icon: Home,
    active: (pathname) => pathname === "/dashboard",
  },
  {
    href: "/patients",
    label: "Aktif Vakalar",
    icon: HeartPulse,
    active: (pathname) => pathname === "/patients" || (pathname.startsWith("/patients/") && pathname !== "/patients/new"),
  },
];

const mapItem: NavItem = {
  href: "/map",
  label: "Harita",
  icon: MapPinned,
  active: (pathname) => pathname === "/map" || pathname.startsWith("/map/"),
};

const historyItem: NavItem = {
  href: "/history",
  label: "Geçmiş",
  icon: History,
  active: (pathname) => pathname === "/history" || pathname.startsWith("/history/"),
};

function StandardNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.active(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition duration-200 active:scale-95",
        isActive ? "bg-brand-50 text-brand-700" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600",
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
      <span className="max-w-full truncate leading-none">{item.label}</span>
      {isActive && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-600" aria-hidden="true" />}
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const isNewPatientActive = pathname === "/patients/new";

  return (
    <nav
      aria-label="Mobil ana menü"
      data-testid="mobile-bottom-nav"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-9 lg:hidden"
    >
      <div className="pointer-events-auto mx-auto grid h-[70px] max-w-md grid-cols-5 items-center rounded-[28px] border border-slate-200/80 bg-white/95 px-2 shadow-[0_16px_45px_rgba(15,23,42,.18)] ring-1 ring-white/80 backdrop-blur-xl">
        {mainItems.map((item) => <StandardNavItem key={item.href} item={item} pathname={pathname} />)}

        <Link
          href="/patients/new"
          aria-label="Yeni Kayıt"
          aria-current={isNewPatientActive ? "page" : undefined}
          className="group relative -mt-8 flex h-[82px] min-w-0 flex-col items-center justify-start text-brand-700 transition active:scale-95"
        >
          <span
            className={cn(
              "grid h-[58px] w-[58px] place-items-center rounded-[22px] bg-brand-600 text-white shadow-[0_10px_24px_rgba(8,127,98,.32)] ring-[7px] ring-canvas transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-brand-700",
              isNewPatientActive && "bg-brand-700 ring-brand-100",
            )}
          >
            <Plus className="h-7 w-7" strokeWidth={2.6} />
          </span>
          <span className="mt-1.5 whitespace-nowrap text-[10px] font-extrabold leading-none">Yeni Kayıt</span>
        </Link>

        <StandardNavItem item={mapItem} pathname={pathname} />
        <StandardNavItem item={historyItem} pathname={pathname} />
      </div>
    </nav>
  );
}
