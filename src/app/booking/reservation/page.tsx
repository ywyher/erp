'use client'

import ReservationAppointmentData from "@/app/booking/reservation/_components/reservation-appointment-data";
import ReservationAttatchFiles from "@/app/booking/reservation/_components/reservation-attatch-files";
import ReservationNotes from "@/app/booking/reservation/_components/reservation-notes";
import { getAppointment } from "@/app/booking/reservation/actions";
import { useAppointmentReservationStore } from "@/components/doctors/store"
import Header from "@/components/header";
import { Appointment, Doctor, User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function Reserved() {
    const router = useRouter();
    const reservation = useAppointmentReservationStore((state) => state.reserved);

    useEffect(() => {
        if (!reservation.reserved || !reservation.appointmentId) {
            router.replace('/dashboard/appointments')
            return;
        }
    }, [router])

    const { data: appointmentData, isLoading } = useQuery({
        queryKey: ['reservation', reservation.appointmentId],
        queryFn: async () => {
            const appointmentData = await getAppointment(reservation.appointmentId as Appointment['id'])
            return appointmentData as {
                appointment: Appointment,
                doctor: Doctor & { user: User },
            };
        },
        enabled: !!reservation.appointmentId
    })

    if (isLoading) return <>Loading...</>

    return (
        <div className="flex flex-col gap-3">
            <Header />
            {appointmentData && (
                <div className="grid grid-cols-2 gap-5 p-5">
                    <ReservationAppointmentData data={appointmentData} />
                    <ReservationNotes />
                </div>
            )}
        </div>
    )
}