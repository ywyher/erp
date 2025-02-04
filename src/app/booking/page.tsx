'use client'

import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions";
import DoctorsList from "@/components/doctors/doctors-list";
import { useAppointmentReservationStore, useDoctorIdStore, useDateStore } from "@/components/doctors/store";
import Header from "@/components/header";
import { getSession } from "@/lib/auth-client";

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

    const { setReserved } = useAppointmentReservationStore()
    const { doctorId, setDoctorId } = useDoctorIdStore()
    const { date, setDate } = useDateStore()

    useEffect(() => {
        async function handleCreateAppointment() {
            try {
                if (!doctorId || !date) return;
                if (!user) {
                    toast.error("Unauthorized, Redirecting to /auth.")
                    router.push('/auth')
                    return;
                }
                const createdAppointment = await createAppointment({
                    patientId: user.id,
                    doctorId: doctorId,
                    createdBy: 'user',
                    status: 'pending',
                    date,
                })

                if (createdAppointment?.success) {
                    toast(createdAppointment.message)
                    setDoctorId(null)
                    setDate(null)
                    setReserved({
                        reserved: true,
                        appointmentId: createdAppointment?.appointmentId
                    })
                    router.push(`/booking/reservation`)
                } else {
                    toast.error(createdAppointment?.message)
                    setDoctorId(null)
                    setDate(null)
                    return;
                }
            } catch (err) {
                toast.error(err as string)
            }
        }

        handleCreateAppointment()
    }, [doctorId, date, user])

    return (
        <>
            <Header />
            <DoctorsList book={true} />
        </>
    )
}