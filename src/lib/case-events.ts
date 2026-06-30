import { STATUS, type InterventionStatus } from "@/lib/constants";

export type CaseEventType = "CREATED" | "RISK_ASSIGNED" | "STATUS_CHANGED" | "NOTE_ADDED" | "TRANSFERRED" | "DISCHARGED" | "DECEASED";

export function eventTypeForStatus(status: InterventionStatus): CaseEventType {
  if (status === "TRANSFERRED") return "TRANSFERRED";
  if (status === "DISCHARGED") return "DISCHARGED";
  if (status === "DECEASED") return "DECEASED";
  return "STATUS_CHANGED";
}

export function eventTitleForStatus(status: InterventionStatus) {
  return `${STATUS[status]} durumuna alındı`;
}
