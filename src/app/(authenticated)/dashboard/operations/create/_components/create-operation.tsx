"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Doctor, User } from "@/lib/db/schema"
import DoctorsList from "@/components/doctors/doctors-list"
import { useDoctorIdStore, useDateStore } from "@/components/doctors/store"
import { createOperation } from "@/app/(authenticated)/dashboard/operations/actions"
import { toast } from "sonner"
import ExistingUser from "@/app/(authenticated)/dashboard/_components/existing-user"
import NewUser from "@/app/(authenticated)/dashboard/_components/new-user"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CustomDate from "@/components/custom-date"
import DataSelector from "@/components/date-selector"

export default function CreateOperation({
  id,
  doctorWorkId,
  role,
}: { id: string; doctorWorkId?: Doctor["id"]; role: "doctor" | "receptionist" | "admin" }) {
  const router = useRouter()

  const [isCreateUser, setIsCreateUser] = useState<boolean>(false)
  const [patientId, setPatientId] = useState<User["id"] | null>(null)
  const [open, setOpen] = useState<boolean>(false)

  const { setDate, date } = useDateStore()
  const { doctorId, setDoctorId } = useDoctorIdStore()

  useEffect(() => {
    async function handleCreateOperation() {
      try {
        if (!doctorId || !date || !patientId) return

        const result = await createOperation({
          patientId: patientId,
          doctorId: doctorId,
          createdBy: role,
          date,
          status: role == "doctor" ? "ongoing" : "pending",
          creatorId: id,
        })

        if (result && result.message) {
          toast(result.message)
          setDoctorId(null)
          setDate(null)
          router.push(`/dashboard/operations/${result.operationId}`)
        } else {
          toast.error(result.message)
          setDoctorId(null)
          setDate(null)
          return
        }
      } catch (err) {
        console.error("Error in useEffect:", err)
      }
    }

    handleCreateOperation()
  }, [doctorId, date, patientId, role, id, router, setDate, setDoctorId])

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
        <>
          <ExistingUser setSelectedUserId={setPatientId} setIsCreateUser={setIsCreateUser} />
          {isCreateUser && <NewUser setCreatedUserId={setPatientId} setIsCreateUser={setIsCreateUser} />}
          <DataSelector 
            onOpenChange={() => {
              setOpen(false)
              setPatientId(null)
            }}
            open={open}
            setDate={setDate}
          />
        </>
      )}
      {patientId && role !== "doctor" && <DoctorsList book={true} customSchedule={true} />}
    </div>
  )
}