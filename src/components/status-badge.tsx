import { normalizeInterventionStatus, STATUS, type InterventionStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const styles: Record<InterventionStatus, string> = {
  WAITING: "bg-amber-50 text-amber-700 ring-amber-600/10",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-600/10",
  TREATED: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  TRANSFERRED: "bg-violet-50 text-violet-700 ring-violet-600/10",
  DISCHARGED: "bg-teal-50 text-teal-700 ring-teal-600/10",
  DECEASED: "bg-slate-200 text-slate-700 ring-slate-600/10",
};

export function StatusBadge({ status }: { status: string }) {
  const safe = normalizeInterventionStatus(status);
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset", styles[safe])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{STATUS[safe]}</span>;
}
