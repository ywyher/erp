import { Consultation } from '@/lib/db/schema';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ConsultationStore = {
  diagnosis: Consultation['diagnosis'] | null;
  setDiagnosis: (diagnosis: Consultation['diagnosis'] | null) => void;
  history: Consultation['history'] | null;
  setHistory: (history: Consultation['history'] | null) => void;
  laboratories: string[];
  setLaboratories: (laboratories: string[]) => void;
  radiologies: string[];
  setRadiologies: (radiologies: string[]) => void;
  medicines: string[];
  setMedicines: (medicines: string[]) => void;
  hasPrescriptions: boolean;
  setHasPrescriptions: (hasPrescriptions: boolean) => void;
};

const createConsultationStore = (appointmentId: string) => 
  create<ConsultationStore>()(
    persist(
      (set) => ({
        diagnosis: null,
        history: null,
        laboratories: [],
        radiologies: [],
        medicines: [],
        hasPrescriptions: false,
        setDiagnosis: (diagnosis) => set({ diagnosis }),
        setHistory: (history) => set({ history }),
        setLaboratories: (laboratories) => set({ laboratories }),
        setRadiologies: (radiologies) => set({ radiologies }),
        setMedicines: (medicines) => set({ medicines }),
        setHasPrescriptions: (hasPrescriptions: boolean) => set({ hasPrescriptions }),
      }),
      {
        name: `consultation-store-${appointmentId}`, // Unique name for each appointment
        storage: createJSONStorage(() => sessionStorage), // Use sessionStorage or localStorage
      }
    )
  );

export const useConsultationStore = (appointmentId: string) => createConsultationStore(appointmentId)();