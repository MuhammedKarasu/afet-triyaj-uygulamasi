import { PrismaClient } from "@prisma/client";
import { calculateRisk, type RiskInput } from "../src/lib/risk";

const prisma = new PrismaClient();

type PatientSeed = RiskInput & {
  fullName: string;
  age: number;
  gender: string;
  locationDescription: string;
  notes?: string;
  interventionStatus?: string;
  latitude?: number;
  longitude?: number;
};

const patients: PatientSeed[] = [
  {
    fullName: "Ayşe Yılmaz", age: 34, gender: "FEMALE", pulse: 138, spo2: 86,
    respiratoryStatus: "DIFFICULT", consciousness: "ALERT", bleeding: "SEVERE", canWalk: false, hasLifeSigns: true,
    locationDescription: "A Blok kuzey enkaz girişi", latitude: 38.4192, longitude: 27.1287,
    notes: "Sol bacakta açık yara, basınç uygulanıyor."
  },
  {
    fullName: "Mehmet Kaya", age: 58, gender: "MALE", pulse: 112, spo2: 92,
    respiratoryStatus: "DIFFICULT", consciousness: "ALERT", bleeding: "MODERATE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Toplanma alanı, sağlık çadırı 2", latitude: 38.4181, longitude: 27.1301,
    notes: "Göğüs ağrısı tarifliyor."
  },
  {
    fullName: "Elif Demir", age: 22, gender: "FEMALE", pulse: 84, spo2: 98,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Cumhuriyet Parkı toplanma alanı", interventionStatus: "COMPLETED"
  },
  {
    fullName: "Hasan Çelik", age: 71, gender: "MALE", pulse: 0, spo2: 0,
    respiratoryStatus: "NONE", consciousness: "UNCONSCIOUS", bleeding: "NONE", canWalk: false, hasLifeSigns: false,
    locationDescription: "C Blok bodrum kat merdiven yanı"
  },
  {
    fullName: "Zeynep Arslan", age: 9, gender: "FEMALE", pulse: 122, spo2: 93,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Okul bahçesi pediatri alanı", interventionStatus: "IN_PROGRESS"
  },
  {
    fullName: "Burak Şahin", age: 41, gender: "MALE", pulse: 76, spo2: 97,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "MODERATE", canWalk: true, hasLifeSigns: true,
    locationDescription: "B Blok doğu cephesi", interventionStatus: "TRANSFERRED"
  },
  {
    fullName: "Nermin Aksoy", age: 66, gender: "FEMALE", pulse: 142, spo2: 89,
    respiratoryStatus: "DIFFICULT", consciousness: "CONFUSED", bleeding: "NONE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Spor salonu geçici bakım alanı"
  },
  {
    fullName: "Emir Koç", age: 29, gender: "MALE", pulse: 88, spo2: 99,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Merkez meydan kayıt noktası"
  },
  {
    fullName: "Selin Aydın", age: 45, gender: "FEMALE", pulse: 105, spo2: 94,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Eczane karşısı ilk yardım noktası"
  },
  {
    fullName: "Ahmet Öz", age: 52, gender: "MALE", pulse: 134, spo2: 91,
    respiratoryStatus: "NORMAL", consciousness: "UNCONSCIOUS", bleeding: "MODERATE", canWalk: false, hasLifeSigns: true,
    locationDescription: "D Blok asansör boşluğu yanı", interventionStatus: "IN_PROGRESS"
  }
];

async function main() {
  await prisma.teamAssignment.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.team.deleteMany();

  const admin = await prisma.user.upsert({
    where: { email: "admin@afet.local" },
    update: { name: "Deniz Yönetici", password: "Admin123!", role: "ADMIN" },
    create: { name: "Deniz Yönetici", email: "admin@afet.local", password: "Admin123!", role: "ADMIN" }
  });
  const medic = await prisma.user.upsert({
    where: { email: "saglik@afet.local" },
    update: { name: "Dr. Ece Sağlam", password: "Saglik123!", role: "MEDIC" },
    create: { name: "Dr. Ece Sağlam", email: "saglik@afet.local", password: "Saglik123!", role: "MEDIC" }
  });
  await prisma.user.upsert({
    where: { email: "gonullu@afet.local" },
    update: { name: "Mert Gönüllü", password: "Gonullu123!", role: "VOLUNTEER" },
    create: { name: "Mert Gönüllü", email: "gonullu@afet.local", password: "Gonullu123!", role: "VOLUNTEER" }
  });

  const alpha = await prisma.team.create({
    data: { name: "Alfa Sağlık Ekibi", members: "Dr. Ece Sağlam, Paramedik Can Kaya, Hemşire İpek Acar", region: "A ve B Blokları", isActive: true }
  });
  const bravo = await prisma.team.create({
    data: { name: "Bravo Arama Kurtarma", members: "Eren Yalçın, Sude Deniz, Onur Ateş, Mert Gönüllü", region: "C ve D Blokları", isActive: true }
  });
  await prisma.team.create({
    data: { name: "Charlie Lojistik", members: "Buse Güler, Ali Kurt", region: "Toplanma Alanı", isActive: false }
  });

  const createdPatients = [];
  for (let index = 0; index < patients.length; index++) {
    const item = patients[index];
    const risk = calculateRisk(item);
    const patient = await prisma.patient.create({
      data: {
        fullName: item.fullName,
        age: item.age,
        gender: item.gender,
        pulse: item.pulse,
        spo2: item.spo2,
        respiratoryStatus: item.respiratoryStatus,
        consciousness: item.consciousness,
        bleeding: item.bleeding,
        canWalk: item.canWalk,
        hasLifeSigns: item.hasLifeSigns,
        locationDescription: item.locationDescription,
        latitude: item.latitude,
        longitude: item.longitude,
        notes: item.notes,
        riskLevel: risk.level,
        riskReason: risk.reason,
        interventionStatus: item.interventionStatus ?? "WAITING",
        createdById: index % 3 === 0 ? admin.id : medic.id,
        createdAt: new Date(Date.now() - index * 47 * 60 * 1000)
      }
    });
    createdPatients.push(patient);

    if (patient.interventionStatus !== "WAITING") {
      await prisma.intervention.create({
        data: {
          patientId: patient.id,
          authorId: medic.id,
          status: patient.interventionStatus,
          note: patient.interventionStatus === "COMPLETED" ? "İlk değerlendirme ve yara bakımı tamamlandı." : "Ekip değerlendirmesi devam ediyor."
        }
      });
    }
  }

  await prisma.teamAssignment.createMany({
    data: [
      { teamId: alpha.id, patientId: createdPatients[0].id },
      { teamId: alpha.id, patientId: createdPatients[1].id },
      { teamId: alpha.id, patientId: createdPatients[4].id },
      { teamId: bravo.id, patientId: createdPatients[3].id },
      { teamId: bravo.id, patientId: createdPatients[9].id }
    ]
  });

  console.log("Demo verileri hazırlandı: 3 kullanıcı, 3 ekip, 10 yaralı.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());

