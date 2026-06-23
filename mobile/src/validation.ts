import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  age: z.number().int().min(0, "Yaş 0 veya daha büyük olmalıdır.").max(120, "Yaş 120'den büyük olamaz."),
  gender: z.enum(["FEMALE", "MALE", "OTHER"]),
  identityNumber: z.string().trim().optional(),
  pulse: z.number().int().min(0, "Nabız 0 veya daha büyük olmalıdır.").max(250, "Nabız 250'den büyük olamaz."),
  spo2: z.number().int().min(0, "SpO₂ 0 veya daha büyük olmalıdır.").max(100, "SpO₂ 100'den büyük olamaz."),
  respiratoryStatus: z.enum(["NORMAL", "DIFFICULT", "NONE"]),
  consciousness: z.enum(["ALERT", "CONFUSED", "UNCONSCIOUS"]),
  bleeding: z.enum(["NONE", "MODERATE", "SEVERE"]),
  canWalk: z.boolean(),
  hasLifeSigns: z.boolean(),
  locationDescription: z.string().trim().min(3, "Konum açıklaması gereklidir."),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().trim().max(500, "Not en fazla 500 karakter olabilir.").optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
