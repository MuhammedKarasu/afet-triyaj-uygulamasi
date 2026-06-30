import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const riskLabels: Record<string, string> = { RED: "Kırmızı", YELLOW: "Sarı", GREEN: "Yeşil", BLACK: "Siyah / Gri" };
const statusLabels: Record<string, string> = {
  WAITING: "Bekliyor",
  IN_PROGRESS: "Müdahale Ediliyor",
  TREATED: "Müdahale Edildi",
  TRANSFERRED: "Sevk Edildi",
  DISCHARGED: "Taburcu Edildi",
  DECEASED: "Vefat Etti",
};

function eventType(status: string) {
  if (status === "TRANSFERRED") return "TRANSFERRED";
  if (status === "DISCHARGED") return "DISCHARGED";
  if (status === "DECEASED") return "DECEASED";
  return "STATUS_CHANGED";
}

async function main() {
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: "asc" },
    include: { interventions: { orderBy: { createdAt: "asc" } }, caseEvents: { select: { id: true } } },
  });
  const sequences = new Map<number, number>();

  for (const patient of patients) {
    const year = patient.createdAt.getFullYear();
    const existingSequence = patient.caseCode?.match(/^AS-\d{4}-(\d+)$/)?.[1];
    if (existingSequence) sequences.set(year, Math.max(sequences.get(year) ?? 0, Number(existingSequence)));
  }

  for (const patient of patients) {
    let caseCode = patient.caseCode;
    if (!caseCode) {
      const year = patient.createdAt.getFullYear();
      const next = (sequences.get(year) ?? 0) + 1;
      sequences.set(year, next);
      caseCode = `AS-${year}-${String(next).padStart(4, "0")}`;
      await prisma.patient.update({ where: { id: patient.id }, data: { caseCode } });
    }

    if (!patient.caseEvents.length) {
      const events = [
        {
          patientId: patient.id,
          createdById: patient.createdById,
          eventType: "CREATED",
          title: "Vaka kaydı oluşturuldu",
          description: `${caseCode} kodlu kayıt ${patient.locationDescription} konumunda oluşturuldu.`,
          createdAt: patient.createdAt,
        },
        {
          patientId: patient.id,
          createdById: patient.createdById,
          eventType: "RISK_ASSIGNED",
          title: `${riskLabels[patient.riskLevel] ?? patient.riskLevel} risk seviyesi atandı`,
          description: patient.riskReason,
          createdAt: new Date(patient.createdAt.getTime() + 1),
        },
        ...patient.interventions.map((intervention) => ({
          patientId: patient.id,
          createdById: intervention.authorId,
          eventType: eventType(intervention.status),
          title: `${statusLabels[intervention.status] ?? intervention.status} durumuna alındı`,
          description: [intervention.destination, intervention.note].filter(Boolean).join(" • ") || null,
          createdAt: intervention.createdAt,
        })),
      ];
      await prisma.caseEvent.createMany({ data: events });
    }
  }

  console.log(`V3.4 vaka kodu ve timeline geçişi tamamlandı: ${patients.length} vaka korundu.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
