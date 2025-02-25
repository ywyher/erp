"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Doctor, Schedule, User } from "@/lib/db/schema"
import DoctorsList from "@/components/doctors/doctors-list"
import { useDoctorIdStore, useDateStore } from "@/components/doctors/store"
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import { toast } from "sonner"
import ExistingUser from "@/app/(authenticated)/dashboard/_components/existing-user"
import NewUser from "@/app/(authenticated)/dashboard/_components/new-user"
import DateSelector from "@/components/date-selector"

export default function CreateAppointment({
  // id from the user table
  id,
  schedules,
  role,
  // id from the doctor table
  doctorWorkId,
}: { schedules: Schedule[]; doctorWorkId?: Doctor["id"]; id: string; role: "doctor" | "receptionist" | 'admin' }) {
  const router = useRouter()

  const [patientId, setPatientId] = useState<User["id"] | null>("")
  const [open, setOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setDate, date } = useDateStore()
  const { doctorId, setDoctorId } = useDoctorIdStore()

  useEffect(() => {
    async function handleCreateAppointment() {
      if (!doctorId || !date || !patientId || isSubmitting) return
      setIsSubmitting(true)

      try {
        const result = await createAppointment({
          patientId: patientId,
          doctorId: doctorId,
          createdBy: role,
          date,
          status: role == "doctor" ? "ongoing" : "pending",
          creatorId: id,
        })

        if (!result || result.error) {
          toast.error(result?.message)
          setDoctorId(null)
          setDate(null)
          return
        }

        toast(result.message)
        setDoctorId(null)
        setDate(null)
        if (role == "doctor") {
          router.push(`/dashboard/appointments/${result.appointmentId}`)
        } else {
          router.push(`/dashboard/appointments`)
        }
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setIsSubmitting(false)
      }
    }

    handleCreateAppointment()
  }, [ doctorId, date, patientId, id, role, router ]), 
  
  // Set the date for the doctor role and open dialog
  useEffect(() => {
    if (role === "doctor" && patientId && doctorWorkId) {
      setDoctorId(doctorWorkId)
      setOpen(true)
    }
  }, [patientId, role, doctorWorkId, setDoctorId])

  return (
    <div className="p-2">
      {!patientId && (
          <ExistingUser title="Create an appointment" setSelectedUserId={setPatientId} newUser={true} />
      )}
      {patientId && role === "doctor" && (
        <>
          <ExistingUser setSelectedUserId={setPatientId} title="Create an operation" newUser={true} />
          <DateSelector 
            onOpenChange={() => {
              setOpen(false)
              setPatientId(null)
            }}
            open={open}
            setDate={setDate}
            schedules={schedules}
          />
        </>
      )}
      {patientId && role != "doctor" && <DoctorsList book={true} customSchedule={true} />}
    </div>
  )
}