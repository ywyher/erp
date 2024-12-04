'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState, } from "react"
import { useRouter } from "next/navigation"
import ExistingUser from "@/app/(authenticated)/dashboard/appointments/create/_components/existing-user"
import { User } from "@/lib/db/schema"
import DoctorsList from "@/components/doctors/doctors-list"
import { useAppointmentReservationStore } from "@/components/doctors/store"
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import NewUser from "@/app/(authenticated)/dashboard/appointments/create/_components/new-user"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/handle-error"

export default function CreateAppointment({ userId, role }: { userId: string, role: 'doctor' | 'receptionist' }) {
    const router = useRouter();

    const [isCreateUser, setIsCreateUser] = useState<boolean>(false)
    const [patientId, setPatientId] = useState<User['id'] | null>(null);

    const { doctorId, schedule, setSchedule, setDoctorId } = useAppointmentReservationStore()

    useEffect(() => {
        async function handleCreateAppointment() {
            try {
                if (!doctorId || !schedule || !patientId) return;

                const result = await createAppointment({
                    patientId: patientId,
                    doctorId: doctorId,
                    createdBy: role,
                    schedule: schedule,
                    receptionistId: role == 'receptionist' ? userId : undefined,
                })

                if (result?.success) {
                    toast(result.message)
                    setDoctorId(null)
                    setSchedule(null)
                    router.push(`/dashboard/appointments`)
                } else {
                    getErrorMessage(result?.message)
                    setDoctorId(null)
                    setSchedule(null)
                    return;
                }
            } catch (err) {
                console.error("Error in useEffect:", err);
            }
        }

        handleCreateAppointment()
    }, [doctorId, schedule, patientId])

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