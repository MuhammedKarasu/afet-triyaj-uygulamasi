import Link from "next/link";
import { ArrowRight, Clock3, HeartPulse, MapPin, Wind } from "lucide-react";
import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

export type PatientCardData = {
  id: string;
  fullName: string;
  riskLevel: string;
  interventionStatus: string;
  locationDescription: string;
  createdAt: Date;
  pulse: number;
  spo2: number;
};

const riskBorder: Record<string, string> = { RED: "border-l-rose-400", YELLOW: "border-l-amber-400", GREEN: "border-l-emerald-400", BLACK: "border-l-slate-500" };
const riskAvatar: Record<string, string> = { RED: "bg-rose-50 text-rose-700", YELLOW: "bg-amber-50 text-amber-700", GREEN: "bg-emerald-50 text-emerald-700", BLACK: "bg-slate-100 text-slate-700" };

export function PatientCard({ patient }: { patient: PatientCardData }) {
  const initials = patient.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("");
  const pulseAlert = patient.pulse > 130;
  const oxygenAlert = patient.spo2 < 90;

  return (
    <Link href={`/patients/${patient.id}`} className={`panel group block border-l-[3px] p-4 transition hover:border-slate-300 hover:shadow-md sm:p-5 ${riskBorder[patient.riskLevel] ?? riskBorder.BLACK}`}>
      <div className="flex items-start gap-3.5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${riskAvatar[patient.riskLevel] ?? riskAvatar.BLACK}`}>{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-1 truncate text-[15px] font-bold text-slate-900">{patient.fullName}</h2>
            <RiskBadge level={patient.riskLevel} compact />
            <StatusBadge status={patient.interventionStatus} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex min-w-0 items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400"/><span className="truncate">{patient.locationDescription}</span></span>
            <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-slate-400"/>{formatDate(patient.createdAt)}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold ${pulseAlert ? "text-rose-700" : "text-slate-600"}`}><HeartPulse className="h-3.5 w-3.5"/>Nabız {patient.pulse}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold ${oxygenAlert ? "text-rose-700" : "text-slate-600"}`}><Wind className="h-3.5 w-3.5"/>SpO₂ %{patient.spo2}</span>
          </div>
        </div>
        <ArrowRight className="mt-3 hidden h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600 sm:block" />
      </div>
    </Link>
  );
}
