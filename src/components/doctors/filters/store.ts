import { Doctor } from "@/lib/db/schema";
import { DateRange } from "react-day-picker";
import { create } from "zustand";

type DoctorFiltersStore = {
  specialty: Doctor["specialty"] | null;
  setSpecialty: (specialty: Doctor["specialty"] | null) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  triggerQuery: number;
  applyChanges: () => void;
};

export const useDoctoruseFiltersStore = create<DoctorFiltersStore>((set) => ({
  specialty: null,
  setSpecialty: (specialty: DoctorFiltersStore["specialty"]) =>
    set({ specialty }),
  dateRange: undefined,
  setDateRange: (dateRange: DateRange | undefined) => set({ dateRange }),
  triggerQuery: 0,
  applyChanges: () =>
    set((state) => ({ triggerQuery: state.triggerQuery + 1 })),
}));
