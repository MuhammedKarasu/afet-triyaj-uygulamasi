import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoTeamLocations: Record<string, { status: string; available: boolean; latitude: number; longitude: number }> = {
  "Alfa Sağlık Ekibi": { status: "AVAILABLE", available: true, latitude: 38.4199, longitude: 27.1279 },
  "Alfa SaÄŸlÄ±k Ekibi": { status: "AVAILABLE", available: true, latitude: 38.4199, longitude: 27.1279 },
  "Bravo Arama Kurtarma": { status: "ON_DUTY", available: false, latitude: 38.4177, longitude: 27.1311 },
  "Charlie Lojistik": { status: "RESTING", available: false, latitude: 38.4168, longitude: 27.1294 },
};

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  const medic = await prisma.user.findFirst({ where: { role: "MEDIC" }, orderBy: { createdAt: "asc" } });
  const actorId = medic?.id ?? admin?.id;

  const teams = await prisma.team.findMany({ include: { assignments: true }, orderBy: { createdAt: "asc" } });
  for (let index = 0; index < teams.length; index++) {
    const team = teams[index];
    const fallback = {
      status: team.isActive ? (index % 2 === 0 ? "AVAILABLE" : "ON_DUTY") : "PASSIVE",
      available: team.isActive && index % 2 === 0,
      latitude: 38.4185 + index * 0.0012,
      longitude: 27.1285 + index * 0.0011,
    };
    const location = demoTeamLocations[team.name] ?? fallback;
    const activeTaskCount = team.assignments.filter((assignment) => !assignment.completedAt).length;
    const status = team.isActive ? (activeTaskCount > 0 ? "ON_DUTY" : location.status) : "PASSIVE";

    await prisma.team.update({
      where: { id: team.id },
      data: {
        status,
        available: status === "AVAILABLE",
        latitude: team.latitude ?? location.latitude,
        longitude: team.longitude ?? location.longitude,
      },
    });
  }

  const assignments = await prisma.teamAssignment.findMany({
    include: { team: true, patient: { select: { id: true, caseCode: true, createdById: true } } },
    orderBy: { assignedAt: "asc" },
  });

  for (const assignment of assignments) {
    const status = assignment.completedAt ? "COMPLETED" : "ASSIGNED";
    const assignedById = assignment.assignedById ?? actorId ?? assignment.patient.createdById;
    await prisma.teamAssignment.update({
      where: { id: assignment.id },
      data: {
        status,
        assignedById,
        note: assignment.note ?? "V3.5 geçişinde mevcut ekip ataması korundu.",
      },
    });

    const existingEvent = await prisma.caseEvent.findFirst({
      where: {
        patientId: assignment.patientId,
        eventType: "TEAM_ASSIGNED",
        description: { contains: assignment.team.name },
      },
      select: { id: true },
    });

    if (!existingEvent) {
      await prisma.caseEvent.create({
        data: {
          patientId: assignment.patientId,
          createdById: assignedById,
          eventType: "TEAM_ASSIGNED",
          title: `${assignment.team.name} vakaya atandı`,
          description: `${assignment.patient.caseCode ?? "Vaka"} için ekip ataması V3.5 operasyon kayıtlarına işlendi.`,
          createdAt: assignment.assignedAt,
        },
      });
    }
  }

  console.log(`V3.5 harita, ekip konumu ve atama geçişi tamamlandı: ${teams.length} ekip, ${assignments.length} atama korundu.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
