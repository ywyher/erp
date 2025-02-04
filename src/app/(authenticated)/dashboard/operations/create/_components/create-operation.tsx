"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/db/schema"
import DoctorsList from "@/components/doctors/doctors-list"
import { useDoctorIdStore, useDateStore } from "@/components/doctors/store"
import { createOperation } from "@/app/(authenticated)/dashboard/operations/actions"
import { toast } from "sonner"
import ExistingUser from "@/app/(authenticated)/dashboard/_components/existing-user"
import NewUser from "@/app/(authenticated)/dashboard/_components/new-user"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CustomDate from "@/components/custom-date"

export default function CreateOperation({ workId, role }: { workId: string; role: "doctor" | "receptionist" }) {
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
          receptionistId: role == "receptionist" ? workId : undefined,
        })

        if (result?.success) {
          toast(result.message)
          setDoctorId(null)
          setDate(null)
          router.push(`/dashboard/operations/${result.operationId}`)
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

    handleCreateOperation()
  }, [doctorId, date, patientId, role, workId, router, setDate, setDoctorId])

  // Set the date for the doctor role and open dialog
  useEffect(() => {
    if (role === "doctor" && patientId) {
      setDoctorId(workId)
      setOpen(true)
    }
  }, [patientId, role, workId, setDoctorId])

  return (
    <div className="p-2">
      <ExistingUser setSelectedUserId={setPatientId} setIsCreateUser={setIsCreateUser} />
      {isCreateUser && <NewUser setCreatedUserId={setPatientId} setIsCreateUser={setIsCreateUser} />}
      {patientId && role === "doctor" && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Date</DialogTitle>
            </DialogHeader>
            <CustomDate onClick={(e) => setDate(e)} />
          </DialogContent>
        </Dialog>
      )}
      {patientId && role === "receptionist" && <DoctorsList book={true} customSchedule={true} />}
    </div>
  )
}