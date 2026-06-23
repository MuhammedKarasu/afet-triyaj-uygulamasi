import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { calculateRisk } from "./risk";
import { demoPatients, demoTeams, demoUser } from "./demo";
import type { InterventionStatus, Patient, PatientDraft, Team, User } from "./types";

const STORAGE_KEY = "afetsaha:v3:state";

type PersistedState = { patients: Patient[]; teams: Team[] };
type AppContextValue = {
  ready: boolean;
  user: User | null;
  patients: Patient[];
  teams: Team[];
  login: (email: string, password: string) => Promise<boolean>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  addPatient: (draft: PatientDraft) => Promise<Patient>;
  updateIntervention: (patientId: string, status: InterventionStatus, note: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>(demoPatients);
  const [teams, setTeams] = useState<Team[]>(demoTeams);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as PersistedState;
        if (Array.isArray(saved.patients)) setPatients(saved.patients);
        if (Array.isArray(saved.teams)) setTeams(saved.teams);
      })
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback(async (nextPatients: Patient[], nextTeams = teams) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ patients: nextPatients, teams: nextTeams } satisfies PersistedState));
  }, [teams]);

  const login = useCallback(async (email: string, password: string) => {
    const accepted = email.trim().toLowerCase() === demoUser.email && password === "Admin123!";
    if (accepted) setUser(demoUser);
    return accepted;
  }, []);

  const loginDemo = useCallback(async () => setUser(demoUser), []);
  const logout = useCallback(() => setUser(null), []);

  const addPatient = useCallback(async (draft: PatientDraft) => {
    const analysis = calculateRisk(draft);
    const patient: Patient = {
      ...draft,
      id: `patient-${Date.now()}`,
      riskLevel: analysis.level,
      riskReason: analysis.reason,
      interventionStatus: "WAITING",
      createdBy: user?.name ?? demoUser.name,
      createdAt: new Date().toISOString(),
      interventions: [],
    };
    const next = [patient, ...patients];
    setPatients(next);
    await persist(next);
    return patient;
  }, [patients, persist, user]);

  const updateIntervention = useCallback(async (patientId: string, status: InterventionStatus, note: string) => {
    const next = patients.map((patient) => patient.id === patientId ? {
      ...patient,
      interventionStatus: status,
      interventions: [{ id: `intervention-${Date.now()}`, status, note, author: user?.name ?? demoUser.name, createdAt: new Date().toISOString() }, ...patient.interventions],
    } : patient);
    setPatients(next);
    await persist(next);
  }, [patients, persist, user]);

  const resetDemoData = useCallback(async () => {
    setPatients(demoPatients);
    setTeams(demoTeams);
    await persist(demoPatients, demoTeams);
  }, [persist]);

  const value = useMemo(() => ({ ready, user, patients, teams, login, loginDemo, logout, addPatient, updateIntervention, resetDemoData }), [ready, user, patients, teams, login, loginDemo, logout, addPatient, updateIntervention, resetDemoData]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp, AppProvider içinde kullanılmalıdır.");
  return context;
}
