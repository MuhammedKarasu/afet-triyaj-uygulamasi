import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateRisk } from "@/lib/risk";
import { patientSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

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
    const patient = await prisma.patient.create({
      data: {
        ...input,
        identityNumber: input.identityNumber || null,
        notes: input.notes || null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        riskLevel: risk.level,
        riskReason: risk.reason,
        createdById: user.id,
      },
    });

    return NextResponse.json({ id: patient.id, riskLevel: risk.level }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Kayıt sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

