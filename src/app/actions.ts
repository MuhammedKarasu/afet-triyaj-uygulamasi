"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireUser, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS, type InterventionStatus } from "@/lib/constants";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.password !== password) {
    redirect("/login?hata=E-posta%20veya%20parola%20hatalı");
  }

  await setSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function updateInterventionAction(formData: FormData) {
  const user = await requireUser(["ADMIN", "MEDIC"]);
  const patientId = String(formData.get("patientId") ?? "");
  const status = String(formData.get("status") ?? "") as InterventionStatus;
  const note = String(formData.get("note") ?? "").trim();

  if (!patientId || !(status in STATUS)) return;

  await prisma.$transaction([
    prisma.patient.update({ where: { id: patientId }, data: { interventionStatus: status } }),
    prisma.intervention.create({
      data: { patientId, authorId: user.id, status, note: note || undefined },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
}

export async function createTeamAction(formData: FormData) {
  await requireUser(["ADMIN"]);
  const name = String(formData.get("name") ?? "").trim();
  const members = String(formData.get("members") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  if (name.length < 3 || members.length < 3 || region.length < 2) return;

  await prisma.team.create({ data: { name, members, region } });
  revalidatePath("/teams");
}

export async function toggleTeamAction(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive")) === "true";
  await prisma.team.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/teams");
}

export async function assignTeamAction(formData: FormData) {
  await requireUser(["ADMIN", "MEDIC"]);
  const patientId = String(formData.get("patientId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!patientId || !teamId) return;

  await prisma.teamAssignment.upsert({
    where: { teamId_patientId: { teamId, patientId } },
    update: {},
    create: { teamId, patientId },
  });
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/teams");
}

