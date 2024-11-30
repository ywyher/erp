import { Doctor, Schedule } from '@/lib/db/schema'
import { create } from 'zustand'

type BookDoctorStore = {
    doctor: Doctor | null,
    setDoctor: (doctor: Doctor | null) => void,
    schedule: Schedule | null,
    setSchedule: (schedule: Schedule | null) => void,
}

export const useBookDoctorStore = create<BookDoctorStore>((set) => ({
    doctor: null,
    setDoctor: (doctor: BookDoctorStore['doctor']) => set((state) => ({ doctor: doctor })),
    schedule: null,
    setSchedule: (schedule: BookDoctorStore['schedule']) => set((state) => ({ schedule: schedule })),
}))