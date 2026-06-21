import type { RiskLevel } from "@/lib/constants";

export type RiskInput = {
  pulse: number;
  spo2: number;
  consciousness: "ALERT" | "CONFUSED" | "UNCONSCIOUS";
  respiratoryStatus: "NORMAL" | "DIFFICULT" | "NONE";
  bleeding: "NONE" | "MODERATE" | "SEVERE";
  canWalk: boolean;
  hasLifeSigns: boolean;
};

export type RiskResult = {
  level: RiskLevel;
  reason: string;
  factors: string[];
};

export function calculateRisk(input: RiskInput): RiskResult {
  if (!input.hasLifeSigns || input.respiratoryStatus === "NONE") {
    return {
      level: "BLACK",
      reason: "Yaşam belirtisi olmadığı işaretlendiği için siyah/gri triyaj atanmıştır.",
      factors: ["Yaşam belirtisi yok", "Solunum gözlenmiyor"],
    };
  }

  const redFactors: string[] = [];
  if (input.consciousness === "UNCONSCIOUS") redFactors.push("Bilinç kapalı");
  if (input.spo2 < 90) redFactors.push(`SpO₂ değeri %${input.spo2} (< %90)`);
  if (input.pulse > 130) redFactors.push(`Nabız ${input.pulse}/dk (> 130)`);
  if (input.bleeding === "SEVERE") redFactors.push("Şiddetli kanama");

  if (redFactors.length) {
    return {
      level: "RED",
      reason: `${redFactors.join(", ")} bulguları nedeniyle kırmızı triyaj atanmıştır.`,
      factors: redFactors,
    };
  }

  const yellowFactors: string[] = [];
  if (input.spo2 >= 90 && input.spo2 <= 94) yellowFactors.push(`SpO₂ değeri %${input.spo2} (%90–94)`);
  if (input.pulse >= 100 && input.pulse <= 130) yellowFactors.push(`Nabız ${input.pulse}/dk (100–130)`);
  if (!input.canWalk) yellowFactors.push("Yürüyemiyor");
  if (input.consciousness === "CONFUSED") yellowFactors.push("Bilinç bulanık");
  if (input.bleeding === "MODERATE") yellowFactors.push("Kontrol edilebilir kanama");
  if (input.respiratoryStatus === "DIFFICULT") yellowFactors.push("Solunum güçlüğü");

  if (yellowFactors.length) {
    return {
      level: "YELLOW",
      reason: `${yellowFactors.join(", ")} bulguları nedeniyle sarı triyaj atanmıştır.`,
      factors: yellowFactors,
    };
  }

  return {
    level: "GREEN",
    reason: "Hayati bulgular normal aralıkta ve kişi yürüyebildiği için yeşil triyaj atanmıştır.",
    factors: ["Hayati bulgular stabil", "Yürüyebiliyor"],
  };
}

