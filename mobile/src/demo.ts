import type { Patient, Team, User } from "./types";

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();

export const demoUser: User = { id: "user-admin", name: "Deniz Yönetici", email: "admin@afet.local", role: "ADMIN" };

export const demoPatients: Patient[] = [
  {
    id: "patient-ayse", fullName: "Ayşe Yılmaz", age: 34, gender: "FEMALE", pulse: 138, spo2: 86,
    respiratoryStatus: "DIFFICULT", consciousness: "ALERT", bleeding: "SEVERE", canWalk: false, hasLifeSigns: true,
    locationDescription: "A Blok kuzey enkaz girişi", latitude: 38.4192, longitude: 27.1287,
    notes: "Sol bacakta açık yara, basınç uygulanıyor.", riskLevel: "RED",
    riskReason: "SpO₂ %86, nabız 138/dk ve şiddetli kanama nedeniyle kırmızı risk atanmıştır.",
    interventionStatus: "WAITING", createdBy: "Deniz Yönetici", createdAt: hoursAgo(1), interventions: [],
  },
  {
    id: "patient-nermin", fullName: "Nermin Aksoy", age: 61, gender: "FEMALE", pulse: 142, spo2: 89,
    respiratoryStatus: "DIFFICULT", consciousness: "CONFUSED", bleeding: "MODERATE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Spor salonu geçici bakım alanı", notes: "Yakın izlem gerekiyor.", riskLevel: "RED",
    riskReason: "SpO₂ %89 ve nabız 142/dk nedeniyle kırmızı risk atanmıştır.",
    interventionStatus: "IN_PROGRESS", createdBy: "Selin Sağlık", createdAt: hoursAgo(3), interventions: [
      { id: "int-1", status: "IN_PROGRESS", note: "Oksijen desteği başlatıldı.", author: "Selin Sağlık", createdAt: hoursAgo(2) },
    ],
  },
  {
    id: "patient-mehmet", fullName: "Mehmet Kaya", age: 47, gender: "MALE", pulse: 112, spo2: 92,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "MODERATE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Toplanma alanı, sağlık çadırı 2", riskLevel: "YELLOW",
    riskReason: "SpO₂ %92, nabız 112/dk ve yürüyememe nedeniyle sarı risk atanmıştır.",
    interventionStatus: "WAITING", createdBy: "Deniz Yönetici", createdAt: hoursAgo(4), interventions: [],
  },
  {
    id: "patient-zeynep", fullName: "Zeynep Arslan", age: 12, gender: "FEMALE", pulse: 122, spo2: 93,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Okul bahçesi pediatri alanı", riskLevel: "YELLOW",
    riskReason: "SpO₂ %93 ve nabız 122/dk nedeniyle sarı risk atanmıştır.",
    interventionStatus: "COMPLETED", createdBy: "Selin Sağlık", createdAt: hoursAgo(5), interventions: [
      { id: "int-2", status: "COMPLETED", note: "Kontrol ve pansuman tamamlandı.", author: "Selin Sağlık", createdAt: hoursAgo(4) },
    ],
  },
  {
    id: "patient-elif", fullName: "Elif Demir", age: 28, gender: "FEMALE", pulse: 84, spo2: 98,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Cumhuriyet Parkı toplanma alanı", riskLevel: "GREEN",
    riskReason: "Hayati bulgular normal aralıkta ve kişi yürüyebildiği için yeşil risk atanmıştır.",
    interventionStatus: "COMPLETED", createdBy: "Gönüllü Ekip", createdAt: hoursAgo(6), interventions: [],
  },
  {
    id: "patient-hasan", fullName: "Hasan Çelik", age: 73, gender: "MALE", pulse: 0, spo2: 0,
    respiratoryStatus: "NONE", consciousness: "UNCONSCIOUS", bleeding: "NONE", canWalk: false, hasLifeSigns: false,
    locationDescription: "C Blok bodrum kat merdiven yanı", riskLevel: "BLACK",
    riskReason: "Yaşam belirtisi olmadığı için siyah/gri triyaj atanmıştır.",
    interventionStatus: "TRANSFERRED", createdBy: "Selin Sağlık", createdAt: hoursAgo(8), interventions: [],
  },
];

export const demoTeams: Team[] = [
  { id: "team-alfa", name: "Alfa Sağlık Ekibi", members: ["Dr. Selin Ak", "Hem. Mert Can", "Ece Kaya"], region: "A ve B Blokları", assignedCount: 3, isActive: true },
  { id: "team-bravo", name: "Bravo Arama Kurtarma", members: ["Emre Yıldız", "Can Ekin", "Sude Arı"], region: "Kuzey enkaz hattı", assignedCount: 2, isActive: true },
  { id: "team-charlie", name: "Charlie Lojistik", members: ["Ozan Koç", "Derya Gül"], region: "Toplanma alanı", assignedCount: 1, isActive: false },
];
