import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  slate: "bg-slate-100 text-slate-600",
  red: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
};

export function StatCard({ label, value, detail, icon: Icon, tone = "slate" }: {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="panel p-4 transition hover:border-slate-300 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold leading-none tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}><Icon className="h-[18px] w-[18px]" /></div>
      </div>
      <p className="mt-3 truncate text-xs text-slate-400">{detail}</p>
    </div>
  );
}
