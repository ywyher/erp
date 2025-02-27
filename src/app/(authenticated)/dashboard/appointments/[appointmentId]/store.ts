import { Consultation } from "@/lib/db/schema";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ConsultationStore = {
  diagnosis: Consultation["diagnosis"] | null;
  setDiagnosis: (diagnosis: Consultation["diagnosis"] | null) => void;
  history: Consultation["history"] | null;
  setHistory: (history: Consultation["history"] | null) => void;
  laboratories: string[];
  setLaboratories: (laboratories: string[]) => void;
  radiologies: string[];
  setRadiologies: (radiologies: string[]) => void;
  medicines: string[];
  setMedicines: (medicines: string[]) => void;
  selectedPrescriptions: string[];
  setSelectedPrescriptions: (selectedPrescriptions: string[]) => void;

  // Prescriptions
  laboratory: string | null;
  radiology: string | null;
  medicine: string | null;
  setLaboratory: (laboratory: string) => void;
  setRadiology: (radiology: string) => void;
  setMedicine: (medicine: string) => void;
  reset: () => void;
};

// Explicitly type the store map
const stores: Record<string, ReturnType<typeof createConsultationStore>> = {};

// Function to create the Zustand store
const createConsultationStore = (appointmentId: string) =>
  create<ConsultationStore>()(
    persist(
      (set) => ({
        diagnosis: null,
        history: null,
        laboratories: [],
        radiologies: [],
        medicines: [],
        selectedPrescriptions: [],
        setDiagnosis: (diagnosis) => set({ diagnosis }),
        setHistory: (history) => set({ history }),
        setLaboratories: (laboratories) => set({ laboratories }),
        setRadiologies: (radiologies) => set({ radiologies }),
        setMedicines: (medicines) => set({ medicines }),
        setSelectedPrescriptions: (selectedPrescriptions) =>
          set({ selectedPrescriptions }),

        // Prescriptions
        laboratory: null,
        medicine: null,
        radiology: null,
        setLaboratory: (laboratory: string) => set({ laboratory }),
        setRadiology: (radiology: string) => set({ radiology }),
        setMedicine: (medicine: string) => set({ medicine }),
        reset: () => {
          sessionStorage.removeItem(`consultation-store-${appointmentId}`);

          set({
            diagnosis: null,
            history: null,
            laboratories: [],
            radiologies: [],
            medicines: [],
            selectedPrescriptions: [],
            laboratory: null,
            medicine: null,
            radiology: null,
          });
        },
      }),
      {
        name: `consultation-store-${appointmentId}`, // Unique storage per appointment
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );

// Zustand hook that ensures isolated state per appointment
export const useConsultationStore = (appointmentId: string) => {
  if (!stores[appointmentId]) {
    stores[appointmentId] = createConsultationStore(appointmentId);
  }
  return stores[appointmentId](); // Automatically call the Zustand hook
};
