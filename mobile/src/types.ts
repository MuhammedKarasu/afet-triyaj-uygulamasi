export type RiskLevel = "RED" | "YELLOW" | "GREEN" | "BLACK";
export type InterventionStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "TRANSFERRED";
export type Gender = "FEMALE" | "MALE" | "OTHER";
export type Consciousness = "ALERT" | "CONFUSED" | "UNCONSCIOUS";
export type RespiratoryStatus = "NORMAL" | "DIFFICULT" | "NONE";
export type Bleeding = "NONE" | "MODERATE" | "SEVERE";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEDIC" | "VOLUNTEER";
};

export type Intervention = {
  id: string;
  status: InterventionStatus;
  note: string;
  author: string;
  createdAt: string;
};

export type Patient = {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  identityNumber?: string;
  pulse: number;
  spo2: number;
  respiratoryStatus: RespiratoryStatus;
  consciousness: Consciousness;
  bleeding: Bleeding;
  canWalk: boolean;
  hasLifeSigns: boolean;
  locationDescription: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  riskLevel: RiskLevel;
  riskReason: string;
  interventionStatus: InterventionStatus;
  createdBy: string;
  createdAt: string;
  interventions: Intervention[];
};

export type Team = {
  id: string;
  name: string;
  members: string[];
  region: string;
  assignedCount: number;
  isActive: boolean;
};

export type PatientDraft = Omit<Patient, "id" | "riskLevel" | "riskReason" | "interventionStatus" | "createdBy" | "createdAt" | "interventions">;
