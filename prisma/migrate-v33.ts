import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const resolvedStatuses = new Set(["TREATED", "TRANSFERRED", "DISCHARGED", "DECEASED"]);

async function main() {
  await prisma.intervention.updateMany({ where: { status: "COMPLETED" }, data: { status: "TREATED" } });
  await prisma.patient.updateMany({ where: { interventionStatus: "COMPLETED" }, data: { interventionStatus: "TREATED" } });

  const patients = await prisma.patient.findMany({
    include: { interventions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  for (const patient of patients) {
    const latest = patient.interventions[0];
    const statusUpdatedAt = latest?.createdAt ?? patient.updatedAt;
    const resolved = resolvedStatuses.has(patient.interventionStatus);

    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        statusNote: patient.statusNote ?? latest?.note ?? null,
        transferDestination: patient.transferDestination ?? latest?.destination ?? null,
        lastStatusUpdateAt: statusUpdatedAt,
        archivedAt: resolved ? patient.archivedAt ?? statusUpdatedAt : null,
      },
    });
  }

  console.log(`V3.3 durum geçişi tamamlandı: ${patients.length} vaka korundu.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
