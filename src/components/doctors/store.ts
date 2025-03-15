import { Appointment, Doctor, Schedule, User } from "@/lib/db/schema";
import { create } from "zustand";

type ReservedState = {
  reserved: boolean | null;
  appointmentId: Appointment["id"] | null;
  patientId: User["id"] | null;
};

type AppointmentReservationStore = {
  reserved: ReservedState;
  setReserved: (partialReserved: Partial<ReservedState>) => void; // Accepts partial updates
};

export const useAppointmentReservationStore =
  create<AppointmentReservationStore>((set) => ({
    reserved: {
      reserved: true,
      appointmentId: 'mg2xc7qt84m9IEQM_WKpv',
      patientId: 'yFONcP1bcmKvtGKhFEDEg',
    },
    setReserved: (reserved) =>
      set({
        reserved: {
          reserved: reserved.reserved ?? null,
          appointmentId: reserved.appointmentId ?? null,
          patientId: reserved.patientId ?? null,
        },
      }),
  }));

type DoctorIdStore = {
  doctorId: Doctor["id"] | null;
  setDoctorId: (doctorId: Doctor["id"] | null) => void;
};

export const useDoctorIdStore = create<DoctorIdStore>((set) => ({
  doctorId: null,
  setDoctorId: (doctorId) => set({ doctorId }),
}));

type TDate = {
  date: Date | null;
  setDate: (date: Date | null) => void;
};

export const useDateStore = create<TDate>((set) => ({
  date: null,
  setDate: (date) => set({ date }),
}));
