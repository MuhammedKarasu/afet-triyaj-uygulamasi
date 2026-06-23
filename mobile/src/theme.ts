export const colors = {
  background: "#F3F7F8",
  surface: "#FFFFFF",
  surfaceMuted: "#EAF2F3",
  text: "#102A2F",
  textMuted: "#667A7E",
  border: "#DDE8EA",
  primary: "#0C8B72",
  primaryDark: "#086B59",
  primarySoft: "#E2F6F0",
  blue: "#3278C8",
  blueSoft: "#EAF3FD",
  red: "#C83F55",
  redSoft: "#FCECEF",
  amber: "#B97416",
  amberSoft: "#FFF4DE",
  green: "#2D8B66",
  greenSoft: "#E8F7EF",
  slate: "#52616B",
  slateSoft: "#EEF1F3",
  white: "#FFFFFF",
  black: "#0B1518",
} as const;

export const radius = { sm: 12, md: 18, lg: 24, pill: 999 } as const;
export const shadow = {
  shadowColor: "#15383E",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 20,
  elevation: 3,
} as const;

export const RISK_META = {
  RED: { label: "Kırmızı", description: "Acil müdahale", color: colors.red, background: colors.redSoft, order: 0 },
  YELLOW: { label: "Sarı", description: "Orta risk", color: colors.amber, background: colors.amberSoft, order: 1 },
  GREEN: { label: "Yeşil", description: "Hafif risk", color: colors.green, background: colors.greenSoft, order: 2 },
  BLACK: { label: "Siyah / Gri", description: "Yaşam belirtisi yok", color: colors.slate, background: colors.slateSoft, order: 3 },
} as const;

export const STATUS_META = {
  WAITING: { label: "Bekliyor", color: colors.amber, background: colors.amberSoft },
  IN_PROGRESS: { label: "Müdahale Ediliyor", color: colors.blue, background: colors.blueSoft },
  COMPLETED: { label: "Müdahale Edildi", color: colors.green, background: colors.greenSoft },
  TRANSFERRED: { label: "Sevk Edildi", color: colors.slate, background: colors.slateSoft },
} as const;
