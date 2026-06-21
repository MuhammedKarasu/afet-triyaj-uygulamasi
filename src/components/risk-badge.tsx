import { AlertTriangle, CheckCircle2, CircleDotDashed, Skull } from "lucide-react";
import { RISK, type RiskLevel } from "@/lib/constants";
import { cn } from "@/lib/utils";

const styles: Record<RiskLevel, string> = {
  RED: "border-rose-200 bg-rose-50 text-rose-700",
  YELLOW: "border-amber-200 bg-amber-50 text-amber-700",
  GREEN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  BLACK: "border-slate-300 bg-slate-100 text-slate-700",
};

const icons = { RED: AlertTriangle, YELLOW: CircleDotDashed, GREEN: CheckCircle2, BLACK: Skull };

export function RiskBadge({ level, compact = false }: { level: string; compact?: boolean }) {
  const safeLevel = (level in RISK ? level : "BLACK") as RiskLevel;
  const Icon = icons[safeLevel];
  return (
    <span title={RISK[safeLevel].description} className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold", compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs", styles[safeLevel])}>
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {RISK[safeLevel].label}
    </span>
  );
}
