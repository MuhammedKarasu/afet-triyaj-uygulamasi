import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateRisk } from "@/lib/risk";
import { patientSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { generateCaseCode } from "@/lib/case-code";
import { RISK } from "@/lib/constants";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın." }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Form bilgileri geçersiz." }, { status: 400 });
    }

    const input = parsed.data;
    const risk = calculateRisk(input);
    const createdAt = new Date();
    const caseCode = await generateCaseCode(createdAt);
    const patient = await prisma.$transaction(async (transaction) => {
      const created = await transaction.patient.create({
        data: {
          ...input,
          caseCode,
          identityNumber: input.identityNumber || null,
          notes: input.notes || null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          riskLevel: risk.level,
          riskReason: risk.reason,
          createdById: user.id,
          createdAt,
          lastStatusUpdateAt: createdAt,
        },
      });
      await transaction.caseEvent.createMany({
        data: [
          {
            patientId: created.id,
            createdById: user.id,
            eventType: "CREATED",
            title: "Vaka kaydı oluşturuldu",
            description: `${caseCode} kodlu kayıt ${input.locationDescription} konumunda oluşturuldu.`,
            createdAt,
          },
          {
            patientId: created.id,
            createdById: user.id,
            eventType: "RISK_ASSIGNED",
            title: `${RISK[risk.level].label} risk seviyesi atandı`,
            description: risk.reason,
            createdAt: new Date(createdAt.getTime() + 1),
          },
          ...(input.latitude && input.longitude ? [{
            patientId: created.id,
            createdById: user.id,
            eventType: "LOCATION_SET",
            title: "Konum bilgisi eklendi",
            description: `${input.latitude.toFixed(5)}, ${input.longitude.toFixed(5)} koordinatı kaydedildi.`,
            createdAt: new Date(createdAt.getTime() + 2),
          }] : []),
        ],
      });
      return created;
    });

    return NextResponse.json({ id: patient.id, caseCode, riskLevel: risk.level }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Kayıt sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
