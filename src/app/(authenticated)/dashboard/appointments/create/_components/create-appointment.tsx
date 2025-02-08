"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Schedule, User } from "@/lib/db/schema"
import DoctorsList from "@/components/doctors/doctors-list"
import { useDoctorIdStore, useDateStore } from "@/components/doctors/store"
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import { toast } from "sonner"
import ExistingUser from "@/app/(authenticated)/dashboard/_components/existing-user"
import NewUser from "@/app/(authenticated)/dashboard/_components/new-user"
import { ScheduleDisplay } from "@/components/schedule-display"
import CustomDate from "@/components/custom-date"

export default function CreateAppointment({
  schedules,
  workId,
  role,
}: { schedules: Schedule[]; workId: string; role: "doctor" | "receptionist" }) {
  const router = useRouter()

  const [isCreateUser, setIsCreateUser] = useState<boolean>(false)
  const [patientId, setPatientId] = useState<User["id"] | null>("mMOh4tppw-RSdnx-wGwjU")
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
          receptionistId: role == "receptionist" ? workId : undefined,
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
  }, [ doctorId, date, patientId, workId, role, router, setDate ]), 
  
  // Added setDate to dependencies
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
              <DialogTitle>Schedules</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="custom">
              <TabsList>
                <TabsTrigger value="offical">Official</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value="offical">
                <ScheduleDisplay onClick={(e) => setDate(e)} dialog={false} schedules={schedules} />
              </TabsContent>
              <TabsContent value="custom">
                <CustomDate onClick={(e) => setDate(e)} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
      {patientId && role === "receptionist" && <DoctorsList book={true} customSchedule={true} />}
    </div>
  )
}