export const RISK = {
  RED: { label: "Kırmızı", description: "Acil müdahale", order: 0 },
  YELLOW: { label: "Sarı", description: "Orta risk", order: 1 },
  GREEN: { label: "Yeşil", description: "Hafif risk", order: 2 },
  BLACK: { label: "Siyah / Gri", description: "Yaşam belirtisi yok", order: 3 },
} as const;

export type RiskLevel = keyof typeof RISK;

export const STATUS = {
  WAITING: "Bekliyor",
  IN_PROGRESS: "Müdahale Ediliyor",
  TREATED: "Müdahale Edildi",
  TRANSFERRED: "Sevk Edildi",
  DISCHARGED: "Taburcu Edildi",
  DECEASED: "Vefat Etti",
} as const;

export type InterventionStatus = keyof typeof STATUS;

export const ACTIVE_STATUSES = ["WAITING", "IN_PROGRESS"] as const satisfies readonly InterventionStatus[];
export const RESOLVED_STATUSES = ["TREATED", "TRANSFERRED", "DISCHARGED", "DECEASED"] as const satisfies readonly InterventionStatus[];
export const LEGACY_RESOLVED_STATUSES = ["COMPLETED"] as const;

export const TEAM_STATUS = {
  AVAILABLE: "Uygun",
  ON_DUTY: "Görevde",
  PASSIVE: "Pasif",
  RESTING: "Dinlenmede",
} as const;

export type TeamStatus = keyof typeof TEAM_STATUS;

export const ASSIGNMENT_STATUS = {
  ASSIGNED: "Atandı",
  EN_ROUTE: "Yolda",
  ON_SCENE: "Olay Yerinde",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
} as const;

export type AssignmentStatus = keyof typeof ASSIGNMENT_STATUS;

export function normalizeInterventionStatus(status: string): InterventionStatus {
  if (status === "COMPLETED") return "TREATED";
  return (status in STATUS ? status : "WAITING") as InterventionStatus;
}

export function isActiveInterventionStatus(status: string) {
  return (ACTIVE_STATUSES as readonly string[]).includes(normalizeInterventionStatus(status));
}

export function isResolvedInterventionStatus(status: string) {
  return (RESOLVED_STATUSES as readonly string[]).includes(normalizeInterventionStatus(status));
}

export const ROLES = {
  ADMIN: "Admin",
  MEDIC: "Sağlık Personeli",
  VOLUNTEER: "Gönüllü",
} as const;

export type UserRole = keyof typeof ROLES;
