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
  transferDestination?: string;
  latitude?: number;
  longitude?: number;
};

const patients: PatientSeed[] = [
  {
    fullName: "Ayşe Yılmaz", age: 34, gender: "FEMALE", pulse: 138, spo2: 86,
    respiratoryStatus: "DIFFICULT", consciousness: "ALERT", bleeding: "SEVERE", canWalk: false, hasLifeSigns: true,
    locationDescription: "A Blok kuzey enkaz girişi", latitude: 38.4192, longitude: 27.1287,
    notes: "Sol bacakta açık yara, basınç uygulanıyor.",
  },
  {
    fullName: "Mehmet Kaya", age: 58, gender: "MALE", pulse: 112, spo2: 92,
    respiratoryStatus: "DIFFICULT", consciousness: "ALERT", bleeding: "MODERATE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Toplanma alanı, sağlık çadırı 2", latitude: 38.4181, longitude: 27.1301,
    notes: "Göğüs ağrısı tarifliyor.",
  },
  {
    fullName: "Elif Demir", age: 22, gender: "FEMALE", pulse: 84, spo2: 98,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Cumhuriyet Parkı toplanma alanı", latitude: 38.4169, longitude: 27.1268, interventionStatus: "TREATED",
  },
  {
    fullName: "Hasan Çelik", age: 71, gender: "MALE", pulse: 0, spo2: 0,
    respiratoryStatus: "NONE", consciousness: "UNCONSCIOUS", bleeding: "NONE", canWalk: false, hasLifeSigns: false,
    locationDescription: "C Blok bodrum kat merdiven yanı", latitude: 38.4175, longitude: 27.1324, interventionStatus: "DECEASED",
  },
  {
    fullName: "Zeynep Arslan", age: 9, gender: "FEMALE", pulse: 122, spo2: 93,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Okul bahçesi pediatri alanı", latitude: 38.4208, longitude: 27.1317, interventionStatus: "IN_PROGRESS",
  },
  {
    fullName: "Burak Şahin", age: 41, gender: "MALE", pulse: 76, spo2: 97,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "MODERATE", canWalk: true, hasLifeSigns: true,
    locationDescription: "B Blok doğu cephesi", latitude: 38.4215, longitude: 27.1275, interventionStatus: "TRANSFERRED",
    transferDestination: "Afet Bölge Eğitim ve Araştırma Hastanesi",
  },
  {
    fullName: "Nermin Aksoy", age: 66, gender: "FEMALE", pulse: 142, spo2: 89,
    respiratoryStatus: "DIFFICULT", consciousness: "CONFUSED", bleeding: "NONE", canWalk: false, hasLifeSigns: true,
    locationDescription: "Spor salonu geçici bakım alanı", latitude: 38.4162, longitude: 27.1304,
  },
  {
    fullName: "Emir Koç", age: 29, gender: "MALE", pulse: 88, spo2: 99,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Merkez meydan kayıt noktası", latitude: 38.4190, longitude: 27.1248, interventionStatus: "DISCHARGED",
  },
  {
    fullName: "Selin Aydın", age: 45, gender: "FEMALE", pulse: 105, spo2: 94,
    respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true,
    locationDescription: "Eczane karşısı ilk yardım noktası", latitude: 38.4179, longitude: 27.1260,
  },
  {
    fullName: "Ahmet Öz", age: 52, gender: "MALE", pulse: 134, spo2: 91,
    respiratoryStatus: "NORMAL", consciousness: "UNCONSCIOUS", bleeding: "MODERATE", canWalk: false, hasLifeSigns: true,
    locationDescription: "D Blok asansör boşluğu yanı", latitude: 38.4159, longitude: 27.1328, interventionStatus: "IN_PROGRESS",
  },
];

const statusNotes: Record<string, string> = {
  IN_PROGRESS: "Saha ekibi değerlendirmesi ve müdahalesi devam ediyor.",
  TREATED: "İlk değerlendirme ve yara bakımı tamamlandı.",
  TRANSFERRED: "İleri değerlendirme için sağlık kurumuna sevk edildi.",
  DISCHARGED: "Saha değerlendirmesi tamamlandı; güvenli şekilde taburcu edildi.",
  DECEASED: "Yaşam bulguları değerlendirilerek kayıt yetkili personel tarafından sonuçlandırıldı.",
};

const statusTitles: Record<string, string> = {
  IN_PROGRESS: "Müdahale Ediliyor",
  TREATED: "Müdahale Edildi",
  TRANSFERRED: "Sevk Edildi",
  DISCHARGED: "Taburcu Edildi",
  DECEASED: "Vefat Etti",
};

const riskLabels: Record<string, string> = {
  RED: "Kırmızı",
  YELLOW: "Sarı",
  GREEN: "Yeşil",
  BLACK: "Siyah / Gri",
};

async function main() {
  await prisma.teamAssignment.deleteMany();
  await prisma.caseEvent.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.team.deleteMany();

  const admin = await prisma.user.upsert({
    where: { email: "admin@afet.local" },
    update: { name: "Deniz Yönetici", password: "Admin123!", role: "ADMIN" },
    create: { name: "Deniz Yönetici", email: "admin@afet.local", password: "Admin123!", role: "ADMIN" },
  });
  const medic = await prisma.user.upsert({
    where: { email: "saglik@afet.local" },
    update: { name: "Dr. Ece Sağlam", password: "Saglik123!", role: "MEDIC" },
    create: { name: "Dr. Ece Sağlam", email: "saglik@afet.local", password: "Saglik123!", role: "MEDIC" },
  });
  await prisma.user.upsert({
    where: { email: "gonullu@afet.local" },
    update: { name: "Mert Gönüllü", password: "Gonullu123!", role: "VOLUNTEER" },
    create: { name: "Mert Gönüllü", email: "gonullu@afet.local", password: "Gonullu123!", role: "VOLUNTEER" },
  });

  const alpha = await prisma.team.create({
    data: {
      name: "Alfa Sağlık Ekibi",
      members: "Dr. Ece Sağlam, Paramedik Can Kaya, Hemşire İpek Acar",
      region: "A ve B Blokları",
      status: "AVAILABLE",
      available: true,
      latitude: 38.4199,
      longitude: 27.1279,
      isActive: true,
    },
  });
  const bravo = await prisma.team.create({
    data: {
      name: "Bravo Arama Kurtarma",
      members: "Eren Yalçın, Sude Deniz, Onur Ateş, Mert Gönüllü",
      region: "C ve D Blokları",
      status: "ON_DUTY",
      available: false,
      latitude: 38.4177,
      longitude: 27.1311,
      isActive: true,
    },
  });
  await prisma.team.create({
    data: {
      name: "Charlie Lojistik",
      members: "Buse Güler, Ali Kurt",
      region: "Toplanma Alanı",
      status: "RESTING",
      available: false,
      latitude: 38.4168,
      longitude: 27.1294,
      isActive: false,
    },
  });

  const createdPatients = [];
  for (let index = 0; index < patients.length; index++) {
    const item = patients[index];
    const risk = calculateRisk(item);
    const createdAt = new Date(Date.now() - index * 47 * 60 * 1000);
    const lastStatusUpdateAt = item.interventionStatus && item.interventionStatus !== "WAITING"
      ? new Date(createdAt.getTime() + 15 * 60 * 1000)
      : createdAt;
    const isResolved = ["TREATED", "TRANSFERRED", "DISCHARGED", "DECEASED"].includes(item.interventionStatus ?? "WAITING");
    const statusNote = statusNotes[item.interventionStatus ?? "WAITING"];

    const patient = await prisma.patient.create({
      data: {
        caseCode: `AS-${createdAt.getFullYear()}-${String(index + 1).padStart(4, "0")}`,
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
        statusNote,
        transferDestination: item.transferDestination,
        lastStatusUpdateAt,
        archivedAt: isResolved ? lastStatusUpdateAt : undefined,
        createdById: index % 3 === 0 ? admin.id : medic.id,
        createdAt,
      },
    });
    createdPatients.push(patient);

    await prisma.caseEvent.createMany({
      data: [
        {
          patientId: patient.id,
          createdById: patient.createdById,
          eventType: "CREATED",
          title: "Vaka kaydı oluşturuldu",
          description: `${patient.caseCode} kodlu kayıt ${patient.locationDescription} konumunda oluşturuldu.`,
          createdAt,
        },
        {
          patientId: patient.id,
          createdById: patient.createdById,
          eventType: "RISK_ASSIGNED",
          title: `${riskLabels[risk.level] ?? risk.level} risk seviyesi atandı`,
          description: risk.reason,
          createdAt: new Date(createdAt.getTime() + 1),
        },
        ...(patient.latitude && patient.longitude ? [{
          patientId: patient.id,
          createdById: patient.createdById,
          eventType: "LOCATION_SET",
          title: "Konum bilgisi eklendi",
          description: `${patient.latitude.toFixed(5)}, ${patient.longitude.toFixed(5)} koordinatı kaydedildi.`,
          createdAt: new Date(createdAt.getTime() + 2),
        }] : []),
        ...(patient.interventionStatus !== "WAITING" ? [{
          patientId: patient.id,
          createdById: medic.id,
          eventType: patient.interventionStatus === "TRANSFERRED" ? "TRANSFERRED" : patient.interventionStatus === "DISCHARGED" ? "DISCHARGED" : patient.interventionStatus === "DECEASED" ? "DECEASED" : "STATUS_CHANGED",
          title: `${statusTitles[patient.interventionStatus] ?? patient.interventionStatus} durumuna alındı`,
          description: [item.transferDestination, statusNote].filter(Boolean).join(" • ") || null,
          createdAt: lastStatusUpdateAt,
        }] : []),
      ],
    });

    if (patient.interventionStatus !== "WAITING") {
      await prisma.intervention.create({
        data: {
          patientId: patient.id,
          authorId: medic.id,
          status: patient.interventionStatus,
          note: statusNote,
          destination: item.transferDestination,
          createdAt: lastStatusUpdateAt,
        },
      });
    }
  }

  const assignments = [
    { teamId: alpha.id, patientId: createdPatients[0].id, note: "Kırmızı risk nedeniyle en yakın sağlık ekibi yönlendirildi." },
    { teamId: alpha.id, patientId: createdPatients[1].id, note: "Sarı riskli vaka için izlem ve stabilizasyon görevi." },
    { teamId: alpha.id, patientId: createdPatients[4].id, note: "Pediatri alanına destek ekibi atandı." },
    { teamId: bravo.id, patientId: createdPatients[3].id, note: "Erişim ve güvenlik değerlendirmesi için arama kurtarma ekibi atandı." },
    { teamId: bravo.id, patientId: createdPatients[9].id, note: "D Blok asansör boşluğu çevresi için müdahale ekibi atandı." },
  ];

  for (const assignment of assignments) {
    await prisma.teamAssignment.create({
      data: {
        ...assignment,
        status: "ASSIGNED",
        assignedById: admin.id,
      },
    });
    const patient = createdPatients.find((item) => item.id === assignment.patientId);
    const team = assignment.teamId === alpha.id ? alpha : bravo;
    await prisma.caseEvent.create({
      data: {
        patientId: assignment.patientId,
        createdById: admin.id,
        eventType: "TEAM_ASSIGNED",
        title: `${team.name} vakaya atandı`,
        description: assignment.note,
        createdAt: new Date((patient?.createdAt ?? new Date()).getTime() + 5 * 60 * 1000),
      },
    });
  }

  console.log("Demo verileri hazırlandı: 3 kullanıcı, 3 ekip, 10 yaralı, V3.5 harita/ekip atamaları.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
