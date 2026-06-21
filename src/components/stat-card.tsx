import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  slate: { icon: "bg-slate-50 text-slate-600 ring-slate-200", bar: "bg-slate-500", glow: "bg-slate-200/40", chip: "bg-slate-100 text-slate-600" },
  red: { icon: "bg-red-50 text-red-600 ring-red-100", bar: "bg-red-500", glow: "bg-red-200/45", chip: "bg-red-50 text-red-700" },
  amber: { icon: "bg-amber-50 text-amber-600 ring-amber-100", bar: "bg-amber-400", glow: "bg-amber-200/45", chip: "bg-amber-50 text-amber-700" },
  emerald: { icon: "bg-emerald-50 text-emerald-600 ring-emerald-100", bar: "bg-emerald-500", glow: "bg-emerald-200/45", chip: "bg-emerald-50 text-emerald-700" },
  blue: { icon: "bg-blue-50 text-blue-600 ring-blue-100", bar: "bg-blue-500", glow: "bg-blue-200/45", chip: "bg-blue-50 text-blue-700" },
  violet: { icon: "bg-violet-50 text-violet-600 ring-violet-100", bar: "bg-violet-500", glow: "bg-violet-200/45", chip: "bg-violet-50 text-violet-700" },
};

export function StatCard({ label, value, detail, icon: Icon, tone = "slate", code, progress }: {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  code?: string;
  progress?: number;
}) {
  const palette = tones[tone];
  const safeProgress = Math.min(100, Math.max(0, progress ?? 0));

  return (
    <div className="panel group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className={cn("absolute inset-x-0 top-0 h-[3px]", palette.bar)} />
      <div className={cn("pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-110", palette.glow)} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">{label}</p>
            {code && <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[8px] font-black tracking-wide", palette.chip)}>{code}</span>}
          </div>
          <p className="mt-2.5 text-[32px] font-black leading-none tracking-[-.04em] text-slate-950">{value}</p>
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl ring-1 ring-inset shadow-sm", palette.icon)}><Icon className="h-5 w-5" /></div>
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-3">
        <p className="truncate text-[11px] font-medium text-slate-400">{detail}</p>
        {progress !== undefined && <span className="shrink-0 text-[10px] font-extrabold text-slate-500">%{Math.round(safeProgress)}</span>}
      </div>
      {progress !== undefined && <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full rounded-full transition-all", palette.bar)} style={{ width: `${safeProgress}%` }} /></div>}
    </div>
  );
}
