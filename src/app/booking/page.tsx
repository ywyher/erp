'use client'

import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions";
import DoctorsList from "@/components/doctors/doctors-list";
import { useBookDoctorStore } from "@/components/doctors/store";
import Header from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Booking() {
    const router = useRouter()

    const { data: user } = useQuery({
        queryKey: ['session', 'booking'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    const { doctor, schedule, setSchedule, setDoctor } = useBookDoctorStore()

    const { toast } = useToast()

    useEffect(() => {
        async function handleCreateAppointment() {
            try {
                if (!doctor || !schedule) return;
                if (!user) {
                    toast({
                        title: "Unauthorized",
                        description: "Redirecting to /auth.",
                        variant: 'destructive'
                    })
                    router.push('/auth')
                    return;
                }
                const result = await createAppointment({
                    patientId: user.id,
                    doctorId: doctor.id,
                    createdBy: 'user',
                    schedule: schedule,
                })

                if (result?.success) {
                    toast({
                        title: "Appointment created successfully",
                        description: result.message,
                    })
                    setDoctor(null)
                    setSchedule(null)
                    router.push(`/dashboard/appointments`)
                } else {
                    toast({
                        title: "Failed to create appointment",
                        description: result?.message || "An error occurred",
                        variant: "destructive"
                    })
                    setDoctor(null)
                    setSchedule(null)
                    return;
                }
            } catch (err) {
                console.error("Error in useEffect:", err);
            }
        }

        handleCreateAppointment()
    }, [doctor, schedule, user])

    return (
        <>
            <Header />
            <DoctorsList book={true} />
        </>
    )
}