"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Ambulance, Filter, MapPin, Navigation, Users } from "lucide-react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { RISK, STATUS, TEAM_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MapPatient = {
  id: string;
  caseCode: string | null;
  fullName: string;
  riskLevel: string;
  interventionStatus: string;
  locationDescription: string;
  latitude: number | null;
  longitude: number | null;
  assignmentCount: number;
  assignedTeams: string[];
};

export type MapTeam = {
  id: string;
  name: string;
  region: string;
  status: string;
  available: boolean;
  latitude: number | null;
  longitude: number | null;
  currentTaskCount: number;
};

type FieldMapProps = {
  patients: MapPatient[];
  teams: MapTeam[];
  initialPatientId?: string;
  initialTeamId?: string;
};

type RiskFilter = "ALL" | "RED" | "YELLOW" | "GREEN" | "BLACK";
type StatusFilter = "ACTIVE" | "WAITING" | "IN_PROGRESS" | "HISTORY";
type AssignmentFilter = "ALL" | "ASSIGNED" | "UNASSIGNED";

const riskTone: Record<string, string> = {
  RED: "#dc2626",
  YELLOW: "#f59e0b",
  GREEN: "#059669",
  BLACK: "#334155",
};

const filterButton = "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-[11px] font-extrabold transition";

export function FieldMap({ patients, teams, initialPatientId, initialTeamId }: FieldMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const patientLayerRef = useRef<LayerGroup | null>(null);
  const teamLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialPatientId ? "HISTORY" : "ACTIVE");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("ALL");

  const visiblePatients = useMemo(() => {
    return patients.filter((patient) => {
      const hasLocation = typeof patient.latitude === "number" && typeof patient.longitude === "number";
      if (!hasLocation) return false;
      const active = patient.interventionStatus === "WAITING" || patient.interventionStatus === "IN_PROGRESS";
      if (statusFilter === "ACTIVE" && !active) return false;
      if (statusFilter === "WAITING" && patient.interventionStatus !== "WAITING") return false;
      if (statusFilter === "IN_PROGRESS" && patient.interventionStatus !== "IN_PROGRESS") return false;
      if (riskFilter !== "ALL" && patient.riskLevel !== riskFilter) return false;
      if (assignmentFilter === "ASSIGNED" && patient.assignmentCount === 0) return false;
      if (assignmentFilter === "UNASSIGNED" && patient.assignmentCount > 0) return false;
      return statusFilter === "HISTORY" || active || patient.id === initialPatientId;
    });
  }, [assignmentFilter, initialPatientId, patients, riskFilter, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        if (!containerRef.current || mapRef.current) return;
        const L = await import("leaflet");
        if (cancelled || !containerRef.current) return;
        leafletRef.current = L;

        const focusedPatient = patients.find((patient) => patient.id === initialPatientId && typeof patient.latitude === "number" && typeof patient.longitude === "number");
        const focusedTeam = teams.find((team) => team.id === initialTeamId && typeof team.latitude === "number" && typeof team.longitude === "number");
        const center: [number, number] = focusedPatient
          ? [focusedPatient.latitude as number, focusedPatient.longitude as number]
          : focusedTeam
            ? [focusedTeam.latitude as number, focusedTeam.longitude as number]
            : [38.4192, 27.1287];

        const map = L.map(containerRef.current, {
          center,
          zoom: focusedPatient || focusedTeam ? 17 : 15,
          zoomControl: false,
          attributionControl: true,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        patientLayerRef.current = L.layerGroup().addTo(map);
        teamLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setReady(true);
      } catch {
        setMapError("Harita yüklenemedi. İnternet bağlantısını veya Leaflet paketini kontrol edin.");
      }
    }

    boot();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialPatientId, initialTeamId, patients, teams]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const patientLayer = patientLayerRef.current;
    const teamLayer = teamLayerRef.current;
    if (!L || !map || !patientLayer || !teamLayer) return;

    patientLayer.clearLayers();
    teamLayer.clearLayers();

    const markerBounds: Array<[number, number]> = [];

    for (const patient of visiblePatients) {
      if (typeof patient.latitude !== "number" || typeof patient.longitude !== "number") continue;
      const color = riskTone[patient.riskLevel] ?? riskTone.BLACK;
      const marker = L.marker([patient.latitude, patient.longitude], {
        icon: L.divIcon({
          className: "",
          html: `<span style="background:${color}" class="field-map-pin field-map-pin-patient">${escapeHtml(patient.caseCode?.slice(-2) ?? "!")}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
      });
      marker.bindPopup(patientPopup(patient));
      marker.addTo(patientLayer);
      markerBounds.push([patient.latitude, patient.longitude]);
    }

    for (const team of teams) {
      if (typeof team.latitude !== "number" || typeof team.longitude !== "number") continue;
      const marker = L.marker([team.latitude, team.longitude], {
        icon: L.divIcon({
          className: "",
          html: `<span class="field-map-pin field-map-pin-team">${escapeHtml(team.name.split(" ").map((part) => part[0]).slice(0, 2).join(""))}</span>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      });
      marker.bindPopup(teamPopup(team));
      marker.addTo(teamLayer);
      markerBounds.push([team.latitude, team.longitude]);
    }

    const focusedPatient = visiblePatients.find((patient) => patient.id === initialPatientId && typeof patient.latitude === "number" && typeof patient.longitude === "number");
    const focusedTeam = teams.find((team) => team.id === initialTeamId && typeof team.latitude === "number" && typeof team.longitude === "number");

    if (focusedPatient) {
      map.setView([focusedPatient.latitude as number, focusedPatient.longitude as number], 17);
    } else if (focusedTeam) {
      map.setView([focusedTeam.latitude as number, focusedTeam.longitude as number], 16);
    } else if (markerBounds.length > 1) {
      map.fitBounds(markerBounds, { padding: [34, 34], maxZoom: 16 });
    } else if (markerBounds.length === 1) {
      map.setView(markerBounds[0], 16);
    }

    setTimeout(() => map.invalidateSize(), 150);
  }, [initialPatientId, initialTeamId, ready, teams, visiblePatients]);

  const statusPills: Array<{ label: string; value: StatusFilter }> = [
    { label: "Tüm aktif vakalar", value: "ACTIVE" },
    { label: "Müdahale bekleyenler", value: "WAITING" },
    { label: "Müdahale ediliyor", value: "IN_PROGRESS" },
    { label: "Geçmişi göster", value: "HISTORY" },
  ];

  const riskPills: Array<{ label: string; value: RiskFilter }> = [
    { label: "Tüm riskler", value: "ALL" },
    { label: RISK.RED.label, value: "RED" },
    { label: RISK.YELLOW.label, value: "YELLOW" },
    { label: RISK.GREEN.label, value: "GREEN" },
    { label: RISK.BLACK.label, value: "BLACK" },
  ];

  const assignmentPills: Array<{ label: string; value: AssignmentFilter }> = [
    { label: "Tüm atamalar", value: "ALL" },
    { label: "Ekip atanmış", value: "ASSIGNED" },
    { label: "Ekip bekleyen", value: "UNASSIGNED" },
  ];

  return (
    <div className="space-y-4">
      <section className="panel overflow-hidden">
        <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-400">
            <Filter className="h-4 w-4 text-brand-600" /> Harita filtreleri
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {statusPills.map((pill) => <button key={pill.value} type="button" onClick={() => setStatusFilter(pill.value)} className={pillClass(statusFilter === pill.value)}>{pill.label}</button>)}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {riskPills.map((pill) => <button key={pill.value} type="button" onClick={() => setRiskFilter(pill.value)} className={pillClass(riskFilter === pill.value)}>{pill.label}</button>)}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {assignmentPills.map((pill) => <button key={pill.value} type="button" onClick={() => setAssignmentFilter(pill.value)} className={pillClass(assignmentFilter === pill.value)}>{pill.label}</button>)}
          </div>
        </div>

        <div className="relative">
          <div ref={containerRef} className="h-[58vh] min-h-[430px] w-full bg-slate-100 md:h-[640px]" />
          {!ready && !mapError && <div className="absolute inset-0 grid place-items-center bg-slate-100/80 text-sm font-semibold text-slate-500">Harita yükleniyor...</div>}
          {mapError && <div className="absolute inset-0 grid place-items-center bg-slate-100/95 p-6 text-center text-sm font-semibold text-slate-600">{mapError}</div>}
          {!visiblePatients.length && ready && <div className="pointer-events-none absolute inset-x-4 top-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-xs font-semibold text-amber-800 shadow-sm">Haritada gösterilecek aktif vaka bulunmuyor.</div>}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="panel p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Haritadaki vakalar</h2>
            <span className="ml-auto rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700">{visiblePatients.length}</span>
          </div>
          {visiblePatients.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {visiblePatients.slice(0, 8).map((patient) => <Link href={`/patients/${patient.id}`} key={patient.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition hover:border-brand-200 hover:bg-white">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: riskTone[patient.riskLevel] ?? riskTone.BLACK }} />
                <span className="font-mono text-[9px] font-black text-slate-400">{patient.caseCode ?? patient.id.slice(-8).toUpperCase()}</span>
                <span className="ml-auto text-[10px] font-bold text-slate-400">{STATUS[patient.interventionStatus as keyof typeof STATUS] ?? patient.interventionStatus}</span>
              </div>
              <p className="mt-1 truncate text-xs font-extrabold text-slate-800">{patient.fullName}</p>
              <p className="mt-1 truncate text-[11px] text-slate-500">{patient.locationDescription}</p>
            </Link>)}
          </div> : <p className="mt-4 text-sm text-slate-500">Haritada gösterilecek aktif vaka bulunmuyor.</p>}
        </div>

        <div className="panel p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Ambulance className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Ekip konumları</h2>
            <span className="ml-auto rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{teams.length}</span>
          </div>
          <div className="mt-4 space-y-2">
            {teams.map((team) => <Link href={`/map?teamId=${team.id}`} key={team.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:bg-slate-50">
              <span className={cn("grid h-9 w-9 place-items-center rounded-xl text-xs font-black", team.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}><Users className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-extrabold text-slate-800">{team.name}</span>
                <span className="block truncate text-[10px] text-slate-400">{TEAM_STATUS[team.status as keyof typeof TEAM_STATUS] ?? team.status} • {team.currentTaskCount} aktif görev</span>
              </span>
              <Navigation className="h-4 w-4 text-slate-300" />
            </Link>)}
          </div>
        </div>
      </section>

      <p className="px-1 text-[10px] leading-5 text-slate-400">
        Mesafe ve konum gösterimleri koordinatlara göre yaklaşık hesaplanır. Harita OpenStreetMap/Leaflet altyapısıyla eğitim ve demo amacıyla kullanılır.
      </p>
    </div>
  );
}

function pillClass(active: boolean) {
  return cn(filterButton, active ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50");
}

function patientPopup(patient: MapPatient) {
  const code = escapeHtml(patient.caseCode ?? patient.id.slice(-8).toUpperCase());
  const risk = escapeHtml(RISK[patient.riskLevel as keyof typeof RISK]?.label ?? patient.riskLevel);
  const status = escapeHtml(STATUS[patient.interventionStatus as keyof typeof STATUS] ?? patient.interventionStatus);
  const teams = patient.assignedTeams.length ? escapeHtml(patient.assignedTeams.join(", ")) : "Ekip bekliyor";

  return `
    <div class="field-map-popup">
      <p class="field-map-code">${code}</p>
      <h3>${escapeHtml(patient.fullName)}</h3>
      <p><b>Risk:</b> ${risk}</p>
      <p><b>Durum:</b> ${status}</p>
      <p><b>Konum:</b> ${escapeHtml(patient.locationDescription)}</p>
      <p><b>Atanan ekip:</b> ${teams}</p>
      <div class="field-map-actions">
        <a href="/patients/${encodeURIComponent(patient.id)}">Detaya Git</a>
        <a href="/patients/${encodeURIComponent(patient.id)}#assign-team">Ekip Ata</a>
      </div>
    </div>
  `;
}

function teamPopup(team: MapTeam) {
  const status = escapeHtml(TEAM_STATUS[team.status as keyof typeof TEAM_STATUS] ?? team.status);
  return `
    <div class="field-map-popup">
      <p class="field-map-code">EKİP</p>
      <h3>${escapeHtml(team.name)}</h3>
      <p><b>Bölge:</b> ${escapeHtml(team.region)}</p>
      <p><b>Durum:</b> ${status}</p>
      <p><b>Uygunluk:</b> ${team.available ? "Uygun" : "Uygun değil"}</p>
      <p><b>Aktif görev:</b> ${team.currentTaskCount}</p>
      <div class="field-map-actions">
        <a href="/teams">Ekipleri Aç</a>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
