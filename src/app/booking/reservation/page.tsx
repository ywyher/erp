'use client'

import ReservationAppointmentData from "@/app/booking/reservation/_components/reservation-appointment-data";
import ReservationAttatchFiles from "@/app/booking/reservation/_components/reservation-attatch-files";
import ReservationNotes from "@/app/booking/reservation/_components/reservation-notes";
import { getAppointment } from "@/app/booking/reservation/actions";
import { useAppointmentReservationStore } from "@/components/doctors/store"
import { Appointment, Doctor, User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function Reserved() {
    const router = useRouter();
    const reservation = useAppointmentReservationStore((state) => state.reserved);

    if (!reservation.reserved || !reservation.appointmentId) {
        router.replace('/dashboard/appointments')
        return;
    }

    const { data: appointmentData, isLoading } = useQuery({
        queryKey: ['reservation', reservation.appointmentId],
        queryFn: async () => {
            const appointmentData = await getAppointment(reservation.appointmentId as Appointment['id'])
            return appointmentData as {
                appointment: Appointment,
                doctor: Doctor & { user: User },
            };
        }
    })

    if (isLoading) return <>Loading...</>

    return (
        <>
            {appointmentData && (
                <div className="grid grid-cols-2 gap-5 p-5">
                    <ReservationAppointmentData data={appointmentData} />
                    <ReservationNotes />
                </div>
            )}
        </>
    )
}