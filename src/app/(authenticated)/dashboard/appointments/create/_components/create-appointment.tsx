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
import { ScheduleDisplay } from "@/components/schedule-display"
import CustomDate from "@/components/custom-date"
import DataSelector from "@/components/date-selector"

export default function CreateAppointment({
  schedules,
  id,
  role,
  doctorWorkId,
}: { schedules: Schedule[]; doctorWorkId?: Doctor["id"]; id: string; role: "doctor" | "receptionist" | 'admin' }) {
  const router = useRouter()

  const [isCreateUser, setIsCreateUser] = useState<boolean>(false)
  const [patientId, setPatientId] = useState<User["id"] | null>("")
  const [open, setOpen] = useState<boolean>(false)

  const { setDate, date } = useDateStore()
  const { doctorId, setDoctorId } = useDoctorIdStore()

  useEffect(() => {
    async function handleCreateAppointment() {
      try {
        if (!doctorId || !date || !patientId) return

        const result = await createAppointment({
          patientId: patientId,
          doctorId: doctorId,
          createdBy: role,
          date,
          status: role == "doctor" ? "ongoing" : "pending",
          creatorId: id,
        })

        if (result?.success) {
          toast(result.message)
          setDoctorId(null)
          setDate(null)
          if (role == "doctor") {
            router.push(`/dashboard/appointments/${result.appointmentId}`)
          } else {
            router.push(`/dashboard/appointments`)
          }
        } else {
          toast.error(result?.message)
          setDoctorId(null)
          setDate(null)
          return
        }
      } catch (err) {
        console.error("Error in useEffect:", err)
      }
    }

    handleCreateAppointment()
  }, [ doctorId, date, patientId, id, role, router, setDate ]), 
  
  // Added setDate to dependencies
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
        <>
          <ExistingUser setSelectedUserId={setPatientId} setIsCreateUser={setIsCreateUser} />
          {isCreateUser && <NewUser setCreatedUserId={setPatientId} setIsCreateUser={setIsCreateUser} />}
        </>
      )}
      {patientId && role === "doctor" && (
        <DataSelector
          open={open}
          onOpenChange={setOpen}
          setDate={setDate}
          schedules={schedules}
        />
      )}
      {patientId && role === "receptionist" && <DoctorsList book={true} customSchedule={true} />}
    </div>
  )
}