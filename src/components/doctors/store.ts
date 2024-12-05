import { Appointment, Doctor, Schedule } from '@/lib/db/schema';
import { create } from 'zustand';

type ReservedState = {
  reserved: boolean | null;
  appointmentId: Appointment['id'] | null;
};

type AppointmentReservationStore = {
  doctorId: Doctor['id'] | null;
  setDoctorId: (doctorId: Doctor['id'] | null) => void;
  schedule: Schedule | null;
  setSchedule: (schedule: Schedule | null) => void;
  reserved: ReservedState;
  setReserved: (partialReserved: Partial<ReservedState>) => void; // Accepts partial updates
};

export const useAppointmentReservationStore = create<AppointmentReservationStore>((set) => ({
  doctorId: null,
  setDoctorId: (doctorId) => set({ doctorId }),
  schedule: null,
  setSchedule: (schedule) => set({ schedule }),
  reserved: {
    reserved: false,
    appointmentId: null,
  },
  setReserved: (reserved) => set({
    reserved: {
      reserved: reserved.reserved ?? null,
      appointmentId: reserved.appointmentId ?? null
    }
  }),
}));