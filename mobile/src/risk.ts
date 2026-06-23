import type { Bleeding, Consciousness, RespiratoryStatus, RiskLevel } from "./types";

export type RiskInput = {
  pulse: number;
  spo2: number;
  consciousness: Consciousness;
  respiratoryStatus: RespiratoryStatus;
  bleeding: Bleeding;
  canWalk: boolean;
  hasLifeSigns: boolean;
};

export type RiskResult = { level: RiskLevel; reason: string; factors: string[] };

export function calculateRisk(input: RiskInput): RiskResult {
  if (!input.hasLifeSigns || input.respiratoryStatus === "NONE") {
    return { level: "BLACK", reason: "Yaşam belirtisi olmadığı için siyah/gri triyaj atanmıştır.", factors: ["Yaşam belirtisi yok", "Solunum gözlenmiyor"] };
  }

  const redFactors: string[] = [];
  if (input.consciousness === "UNCONSCIOUS") redFactors.push("Bilinç kapalı");
  if (input.spo2 < 90) redFactors.push(`SpO₂ %${input.spo2}`);
  if (input.pulse > 130) redFactors.push(`Nabız ${input.pulse}/dk`);
  if (input.bleeding === "SEVERE") redFactors.push("Şiddetli kanama");
  if (redFactors.length) return { level: "RED", reason: `${redFactors.join(" ve ")} nedeniyle kırmızı risk atanmıştır.`, factors: redFactors };

  const yellowFactors: string[] = [];
  if (input.spo2 >= 90 && input.spo2 <= 94) yellowFactors.push(`SpO₂ %${input.spo2}`);
  if (input.pulse >= 100 && input.pulse <= 130) yellowFactors.push(`Nabız ${input.pulse}/dk`);
  if (!input.canWalk) yellowFactors.push("Yürüyemiyor");
  if (input.consciousness === "CONFUSED") yellowFactors.push("Bilinç bulanık");
  if (input.bleeding === "MODERATE") yellowFactors.push("Kontrollü kanama");
  if (input.respiratoryStatus === "DIFFICULT") yellowFactors.push("Solunum güçlüğü");
  if (yellowFactors.length) return { level: "YELLOW", reason: `${yellowFactors.join(" ve ")} nedeniyle sarı risk atanmıştır.`, factors: yellowFactors };

  return { level: "GREEN", reason: "Hayati bulgular normal aralıkta ve kişi yürüyebildiği için yeşil risk atanmıştır.", factors: ["Hayati bulgular stabil", "Yürüyebiliyor"] };
}
