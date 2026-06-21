import { AlertTriangle, CheckCircle2, CircleDotDashed, Skull } from "lucide-react";
import { RISK, type RiskLevel } from "@/lib/constants";
import { cn } from "@/lib/utils";

const styles: Record<RiskLevel, string> = {
  RED: "border-red-200/90 bg-gradient-to-r from-red-50 to-white text-red-700 shadow-[0_1px_2px_rgba(220,38,38,.08)]",
  YELLOW: "border-amber-200/90 bg-gradient-to-r from-amber-50 to-white text-amber-700 shadow-[0_1px_2px_rgba(217,119,6,.08)]",
  GREEN: "border-emerald-200/90 bg-gradient-to-r from-emerald-50 to-white text-emerald-700 shadow-[0_1px_2px_rgba(5,150,105,.08)]",
  BLACK: "border-slate-300 bg-gradient-to-r from-slate-100 to-white text-slate-700 shadow-[0_1px_2px_rgba(71,85,105,.08)]",
};

const icons = { RED: AlertTriangle, YELLOW: CircleDotDashed, GREEN: CheckCircle2, BLACK: Skull };

export function RiskBadge({ level, compact = false }: { level: string; compact?: boolean }) {
  const safeLevel = (level in RISK ? level : "BLACK") as RiskLevel;
  const Icon = icons[safeLevel];
  return (
    <span title={RISK[safeLevel].description} className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-extrabold", compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs", styles[safeLevel])}>
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {RISK[safeLevel].label}
    </span>
  );
}
