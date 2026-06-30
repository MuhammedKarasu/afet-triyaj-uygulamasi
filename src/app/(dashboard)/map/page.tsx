import Link from "next/link";
import { Ambulance, ClipboardPlus, Layers, MapPinned, MapPin, Radio, Users } from "lucide-react";
import { FieldMap, type MapPatient, type MapTeam } from "@/components/field-map";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/auth";
import { ACTIVE_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MapPage({ searchParams }: { searchParams: Promise<{ patientId?: string; teamId?: string }> }) {
  await requireUser();
  const { patientId, teamId } = await searchParams;
  const activeStatuses = [...ACTIVE_STATUSES];

  const [patients, teams, activeWithLocation, activeWithoutLocation, assignedActive, unassignedActive, availableTeams, onDutyTeams] = await Promise.all([
    prisma.patient.findMany({
      include: { assignments: { include: { team: { select: { name: true } } } } },
      orderBy: [{ interventionStatus: "asc" }, { createdAt: "desc" }],
    }),
    prisma.team.findMany({
      include: {
        assignments: {
          where: { patient: { interventionStatus: { in: activeStatuses } }, completedAt: null },
          include: { patient: { select: { id: true } } },
        },
      },
      orderBy: [{ available: "desc" }, { name: "asc" }],
    }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, latitude: { not: null }, longitude: { not: null } } }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, OR: [{ latitude: null }, { longitude: null }] } }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, assignments: { some: { completedAt: null } } } }),
    prisma.patient.count({ where: { interventionStatus: { in: activeStatuses }, assignments: { none: { completedAt: null } } } }),
    prisma.team.count({ where: { status: "AVAILABLE", available: true, isActive: true } }),
    prisma.team.count({ where: { status: "ON_DUTY", isActive: true } }),
  ]);

  const mapPatients: MapPatient[] = patients.map((patient) => ({
    id: patient.id,
    caseCode: patient.caseCode,
    fullName: patient.fullName,
    riskLevel: patient.riskLevel,
    interventionStatus: patient.interventionStatus,
    locationDescription: patient.locationDescription,
    latitude: patient.latitude,
    longitude: patient.longitude,
    assignmentCount: patient.assignments.filter((assignment) => !assignment.completedAt).length,
    assignedTeams: patient.assignments.filter((assignment) => !assignment.completedAt).map((assignment) => assignment.team.name),
  }));

  const mapTeams: MapTeam[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    region: team.region,
    status: team.status,
    available: team.available,
    latitude: team.latitude,
    longitude: team.longitude,
    currentTaskCount: team.assignments.length,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Saha koordinasyonu"
        title="Saha Haritası"
        description="Aktif vakaları risk renklerine göre haritada izleyin, ekip konumlarını görün ve uygun ekibi vakaya yönlendirin."
        icon={MapPinned}
        actions={<>
          <Link href="/patients/new" className="btn-secondary"><ClipboardPlus className="h-4 w-4" />Yeni vaka</Link>
          <Link href="/teams" className="btn-primary"><Users className="h-4 w-4" />Ekipleri yönet</Link>
        </>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-6">
        <StatCard label="Konumlu Aktif" value={activeWithLocation} detail="Haritada işaretli vaka" icon={MapPin} tone="emerald" />
        <StatCard label="Konumsuz Aktif" value={activeWithoutLocation} detail="Manuel konum bekliyor" icon={Layers} tone="amber" />
        <StatCard label="Ekip Atanmış" value={assignedActive} detail="Aktif görev bağlantısı" icon={Ambulance} tone="blue" />
        <StatCard label="Ekip Bekleyen" value={unassignedActive} detail="Atama bekleyen vaka" icon={Radio} tone="red" />
        <StatCard label="Uygun Ekip" value={availableTeams} detail="Atamaya hazır" icon={Users} tone="emerald" />
        <StatCard label="Görevde Ekip" value={onDutyTeams} detail="Sahada aktif" icon={Ambulance} tone="violet" />
      </div>

      <FieldMap patients={mapPatients} teams={mapTeams} initialPatientId={patientId} initialTeamId={teamId} />
    </>
  );
}
