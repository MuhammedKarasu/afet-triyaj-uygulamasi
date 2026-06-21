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
  COMPLETED: "Müdahale Edildi",
  TRANSFERRED: "Sevk Edildi",
} as const;

export type InterventionStatus = keyof typeof STATUS;

export const ROLES = {
  ADMIN: "Admin",
  MEDIC: "Sağlık Personeli",
  VOLUNTEER: "Gönüllü",
} as const;

export type UserRole = keyof typeof ROLES;

