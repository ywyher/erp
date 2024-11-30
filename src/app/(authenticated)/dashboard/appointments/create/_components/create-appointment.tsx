'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState, } from "react"
import { useRouter } from "next/navigation"
import ExistingUser from "@/app/(authenticated)/dashboard/appointments/create/_components/existing-user"
import { User } from "@/lib/db/schema"
import DoctorsList from "@/components/doctors/doctors-list"
import { useBookDoctorStore } from "@/components/doctors/store"
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import { useToast } from "@/hooks/use-toast"
import NewUser from "@/app/(authenticated)/dashboard/appointments/create/_components/new-user"

export default function CreateAppointment({ userId, role }: { userId: string, role: 'doctor' | 'receptionist' }) {
    const router = useRouter();

    const [isCreateUser, setIsCreateUser] = useState<boolean>(false)
    const [patientId, setPatientId] = useState<User['id'] | null>(null);

    const { doctor, schedule, setSchedule, setDoctor } = useBookDoctorStore()

    const { toast } = useToast()

    useEffect(() => {
        async function handleCreateAppointment() {
            try {
                if (!doctor || !schedule || !patientId) return;

                const result = await createAppointment({
                    patientId: patientId,
                    doctorId: doctor.id,
                    createdBy: role,
                    schedule: schedule,
                    receptionistId: role == 'receptionist' ? userId : undefined,
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
    }, [doctor, schedule, patientId])

    return (
        <div className="p-2">
            {patientId ? (
                <DoctorsList book={true} />
            ) : (
                <>
                    <ExistingUser setIsCreateUser={setIsCreateUser} setPatientId={setPatientId} userId={userId} role={role} />
                    {isCreateUser && (
                        <NewUser userId={userId} role={role} setPatientId={setPatientId} />
                    )}
                </>
            )}
        </div>
    )
}