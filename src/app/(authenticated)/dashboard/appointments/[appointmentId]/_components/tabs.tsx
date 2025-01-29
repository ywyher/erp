"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Consultation from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/consultation/consultation"
import UserMedicalFiles from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/user-data/medical-files"
import UserData from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/user-data/user-data"
import type { Appointment, Doctor, MedicalFile, User } from "@/lib/db/schema"
import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store"
import { useEffect, useState } from "react"
import Prescriptions from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/prescriptions/page"

type AppointmentTabs = {
  user: User
  medicalFiles: MedicalFile[]
  appointmentId: Appointment["id"]
  doctorId: Doctor["id"]
}

export default function AppointmentTabs({ user, medicalFiles, appointmentId, doctorId }: AppointmentTabs) {
  const { setHasPrescriptions, hasPrescriptions } = useConsultationStore(appointmentId)
  const [activeTab, setActiveTab] = useState<"user" | "prescriptions" | "consultation">("user")
  const [hasPrescriptionsState, setHasPrescriptionsState] = useState<boolean>(false)

  useEffect(() => {
    if (hasPrescriptionsState) {
      setActiveTab("prescriptions")
      setHasPrescriptions(true)
    }
  }, [hasPrescriptionsState])

  useEffect(() => {
    if(hasPrescriptions) {
      setActiveTab('prescriptions')
    }
  }, [hasPrescriptions])

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
      <TabsList>
        <TabsTrigger className="w-full" value="user">
          User Data
        </TabsTrigger>
        <TabsTrigger className="w-full" value="consultation">
          Consultation
        </TabsTrigger>
        {(hasPrescriptionsState || hasPrescriptions) && (
          <TabsTrigger className="w-full" value="prescriptions">
            Prescriptions
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="user" className="flex flex-col gap-3">
        <UserData user={user} />
        <UserMedicalFiles files={medicalFiles} />
      </TabsContent>
      <TabsContent value="consultation">
        <Consultation
         setHasPrescriptions={setHasPrescriptionsState}
         appointmentId={appointmentId}
         doctorId={doctorId} patientId={user.id}
        />
      </TabsContent>
      {(hasPrescriptionsState || hasPrescriptions) && (
        <TabsContent value="prescriptions">
          <Prescriptions appointmentId={appointmentId} />
        </TabsContent>
      )}
    </Tabs>
  )
}