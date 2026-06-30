import { prisma } from "@/lib/prisma";

export async function generateCaseCode(createdAt = new Date()) {
  const year = createdAt.getFullYear();
  const prefix = `AS-${year}-`;
  const latest = await prisma.patient.findFirst({
    where: { caseCode: { startsWith: prefix } },
    orderBy: { caseCode: "desc" },
    select: { caseCode: true },
  });
  const lastSequence = Number(latest?.caseCode?.slice(prefix.length)) || 0;
  return `${prefix}${String(lastSequence + 1).padStart(4, "0")}`;
}
