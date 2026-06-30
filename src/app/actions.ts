"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireUser, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ASSIGNMENT_STATUS,
  isResolvedInterventionStatus,
  STATUS,
  TEAM_STATUS,
  type AssignmentStatus,
  type InterventionStatus,
  type TeamStatus,
} from "@/lib/constants";
import { eventTitleForStatus, eventTypeForStatus } from "@/lib/case-events";

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
  const destination = String(formData.get("destination") ?? "").trim();

  if (!patientId || !(status in STATUS) || note.length < 3) return;

  const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { id: true } });
  if (!patient) return;

  const now = new Date();
  const resolved = isResolvedInterventionStatus(status);
  const transferDestination = status === "TRANSFERRED" ? destination || null : null;

  await prisma.$transaction([
    prisma.patient.update({
      where: { id: patientId },
      data: {
        interventionStatus: status,
        statusNote: note,
        transferDestination,
        lastStatusUpdateAt: now,
        archivedAt: resolved ? now : null,
      },
    }),
    prisma.intervention.create({
      data: { patientId, authorId: user.id, status, note, destination: transferDestination },
    }),
    prisma.caseEvent.create({
      data: {
        patientId,
        createdById: user.id,
        eventType: eventTypeForStatus(status),
        title: eventTitleForStatus(status),
        description: [transferDestination, note].filter(Boolean).join(" • "),
        createdAt: now,
      },
    }),
    prisma.teamAssignment.updateMany({ where: { patientId }, data: { completedAt: resolved ? now : null, status: resolved ? "COMPLETED" : "ASSIGNED" } }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/patients");
  revalidatePath("/history");
  revalidatePath("/teams");
  revalidatePath(`/patients/${patientId}`);
}

export async function createTeamAction(formData: FormData) {
  await requireUser(["ADMIN"]);
  const name = String(formData.get("name") ?? "").trim();
  const members = String(formData.get("members") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const status = String(formData.get("status") ?? "AVAILABLE") as TeamStatus;
  const latitude = String(formData.get("latitude") ?? "").trim();
  const longitude = String(formData.get("longitude") ?? "").trim();
  if (name.length < 3 || members.length < 3 || region.length < 2) return;

  await prisma.team.create({
    data: {
      name,
      members,
      region,
      status: status in TEAM_STATUS ? status : "AVAILABLE",
      available: status === "AVAILABLE",
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      isActive: status !== "PASSIVE",
    },
  });
  revalidatePath("/teams");
  revalidatePath("/map");
}

export async function toggleTeamAction(formData: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive")) === "true";
  await prisma.team.update({
    where: { id },
    data: {
      isActive: !isActive,
      status: isActive ? "PASSIVE" : "AVAILABLE",
      available: !isActive,
    },
  });
  revalidatePath("/teams");
  revalidatePath("/map");
  revalidatePath("/dashboard");
}

export async function updateTeamStatusAction(formData: FormData) {
  await requireUser(["ADMIN", "MEDIC"]);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as TeamStatus;
  if (!id || !(status in TEAM_STATUS)) return;

  await prisma.team.update({
    where: { id },
    data: {
      status,
      available: status === "AVAILABLE",
      isActive: status !== "PASSIVE",
    },
  });
  revalidatePath("/teams");
  revalidatePath("/map");
  revalidatePath("/dashboard");
}

export async function assignTeamAction(formData: FormData) {
  const user = await requireUser(["ADMIN", "MEDIC"]);
  const patientId = String(formData.get("patientId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!patientId || !teamId) return;

  const now = new Date();
  const [patient, team] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { id: true, caseCode: true } }),
    prisma.team.findUnique({ where: { id: teamId }, select: { id: true, name: true } }),
  ]);
  if (!patient || !team) return;

  await prisma.$transaction(async (transaction) => {
    const existing = await transaction.teamAssignment.findUnique({
      where: { teamId_patientId: { teamId, patientId } },
      select: { id: true },
    });

    if (existing) {
      await transaction.teamAssignment.update({
        where: { id: existing.id },
        data: {
          status: "ASSIGNED",
          note: note || "Ekip ataması güncellendi.",
          assignedById: user.id,
          completedAt: null,
        },
      });
    } else {
      await transaction.teamAssignment.create({
        data: {
          teamId,
          patientId,
          status: "ASSIGNED",
          note: note || "Ekip vaka için görevlendirildi.",
          assignedById: user.id,
          assignedAt: now,
        },
      });
    }

    await transaction.team.update({
      where: { id: teamId },
      data: { status: "ON_DUTY", available: false, isActive: true },
    });

    await transaction.caseEvent.create({
      data: {
        patientId,
        createdById: user.id,
        eventType: "TEAM_ASSIGNED",
        title: `${team.name} vakaya atandı`,
        description: note || `${patient.caseCode ?? "Vaka"} için ekip ataması yapıldı.`,
        createdAt: now,
      },
    });
  });
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/teams");
  revalidatePath("/map");
  revalidatePath("/dashboard");
}

export async function updateAssignmentStatusAction(formData: FormData) {
  const user = await requireUser(["ADMIN", "MEDIC"]);
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const status = String(formData.get("status") ?? "") as AssignmentStatus;
  const note = String(formData.get("note") ?? "").trim();
  if (!assignmentId || !(status in ASSIGNMENT_STATUS)) return;

  const assignment = await prisma.teamAssignment.findUnique({
    where: { id: assignmentId },
    include: { team: { select: { id: true, name: true } }, patient: { select: { id: true, caseCode: true } } },
  });
  if (!assignment) return;

  const now = new Date();
  const completed = status === "COMPLETED" || status === "CANCELLED";

  await prisma.$transaction(async (transaction) => {
    await transaction.teamAssignment.update({
      where: { id: assignmentId },
      data: {
        status,
        note: note || assignment.note,
        completedAt: completed ? now : null,
      },
    });

    const activeAssignmentCount = await transaction.teamAssignment.count({
      where: {
        teamId: assignment.teamId,
        id: { not: assignmentId },
        status: { in: ["ASSIGNED", "EN_ROUTE", "ON_SCENE"] },
        completedAt: null,
      },
    });

    if (completed && activeAssignmentCount === 0) {
      await transaction.team.update({
        where: { id: assignment.teamId },
        data: { status: "AVAILABLE", available: true },
      });
    } else if (!completed) {
      await transaction.team.update({
        where: { id: assignment.teamId },
        data: { status: "ON_DUTY", available: false, isActive: true },
      });
    }

    await transaction.caseEvent.create({
      data: {
        patientId: assignment.patientId,
        createdById: user.id,
        eventType: completed ? "TEAM_ASSIGNMENT_CLOSED" : "TEAM_STATUS_CHANGED",
        title: `${assignment.team.name} atama durumu: ${ASSIGNMENT_STATUS[status]}`,
        description: note || `${assignment.patient.caseCode ?? "Vaka"} ekip atama durumu güncellendi.`,
        createdAt: now,
      },
    });
  });

  revalidatePath(`/patients/${assignment.patientId}`);
  revalidatePath("/teams");
  revalidatePath("/map");
  revalidatePath("/dashboard");
}
