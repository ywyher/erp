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
  const { selectedPrescriptions } = useConsultationStore(appointmentId); // Invoke the Zustand store function
  const [activeTab, setActiveTab] = useState<"user" | "prescriptions" | "consultation">("user")

  useEffect(() => {
    if(selectedPrescriptions.length > 0) {
      console.log(selectedPrescriptions)
      setActiveTab('prescriptions')
    }
  }, [selectedPrescriptions])

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
      <TabsList>
        <TabsTrigger className="w-full" value="user">
          User Data
        </TabsTrigger>
        <TabsTrigger className="w-full" value="consultation">
          Consultation
        </TabsTrigger>
        {selectedPrescriptions.length > 0 && (
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
         appointmentId={appointmentId}
         doctorId={doctorId} patientId={user.id}
        />
      </TabsContent>
      {selectedPrescriptions.length > 0 && (
        <TabsContent value="prescriptions">
          <Prescriptions 
            appointmentId={appointmentId} 
            doctorId={doctorId}
            patientId={user.id}
          />
        </TabsContent>
      )}
    </Tabs>
  )
}