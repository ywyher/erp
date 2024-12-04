'use client'

import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions";
import DoctorsList from "@/components/doctors/doctors-list";
import { useAppointmentReservationStore } from "@/components/doctors/store";
import Header from "@/components/header";
import { getSession } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/handle-error";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Booking() {
    const router = useRouter()

    const { data: user } = useQuery({
        queryKey: ['session', 'booking'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    const { doctorId, schedule, setSchedule, setDoctorId, setReserved } = useAppointmentReservationStore()

    useEffect(() => {
        async function handleCreateAppointment() {
            try {
                if (!doctorId || !schedule) return;
                if (!user) {
                    getErrorMessage("Unauthorized, Redirecting to /auth.")
                    router.push('/auth')
                    return;
                }
                const createdAppointment = await createAppointment({
                    patientId: user.id,
                    doctorId: doctorId,
                    createdBy: 'user',
                    schedule: schedule,
                })

                if (createdAppointment?.success) {
                    toast(createdAppointment.message)
                    setDoctorId(null)
                    setSchedule(null)
                    setReserved({
                        reserved: true,
                        appointmentId: createdAppointment?.appointmentId
                    })
                    router.push(`/booking/reservation`)
                } else {
                    getErrorMessage(createdAppointment?.message)
                    setDoctorId(null)
                    setSchedule(null)
                    return;
                }
            } catch (err) {
                getErrorMessage(err)
            }
        }

        handleCreateAppointment()
    }, [doctorId, schedule, user])

    return (
        <>
            <Header />
            <DoctorsList book={true} />
        </>
    )
}