import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalıdır."),
  age: z.coerce.number().int().min(0, "Yaş 0'dan küçük olamaz.").max(120, "Geçerli bir yaş giriniz."),
  gender: z.enum(["FEMALE", "MALE", "OTHER"], { required_error: "Cinsiyet seçiniz." }),
  identityNumber: z.string().trim().max(20, "Kimlik bilgisi çok uzun.").optional().or(z.literal("")),
  pulse: z.coerce.number().int().min(0, "Nabız 0'dan küçük olamaz.").max(250, "Nabız 250'den büyük olamaz."),
  spo2: z.coerce.number().int().min(0, "SpO₂ 0'dan küçük olamaz.").max(100, "SpO₂ 100'den büyük olamaz."),
  respiratoryStatus: z.enum(["NORMAL", "DIFFICULT", "NONE"]),
  consciousness: z.enum(["ALERT", "CONFUSED", "UNCONSCIOUS"]),
  bleeding: z.enum(["NONE", "MODERATE", "SEVERE"]),
  canWalk: z.boolean(),
  hasLifeSigns: z.boolean(),
  locationDescription: z.string().trim().min(3, "Konum açıklaması zorunludur."),
  latitude: z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().min(-90).max(90).optional()),
  longitude: z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().min(-180).max(180).optional()),
  notes: z.string().trim().max(1000, "Not en fazla 1000 karakter olabilir.").optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

