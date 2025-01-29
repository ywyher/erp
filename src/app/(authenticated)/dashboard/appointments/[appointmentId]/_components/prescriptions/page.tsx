'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store"
import { appointment, Doctor, User, type Appointment } from "@/lib/db/schema"
import Prescription from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/prescriptions/prescription"
import { createConsultation, createPrescription } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/actions"
import { toast } from "sonner"
import { useState } from "react"
import { PrescriptionTypes } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/types"
import { updateAppointmentStatus } from "@/app/(authenticated)/dashboard/appointments/actions"
import { useRouter } from "next/navigation"
import LoadingBtn from "@/components/loading-btn"
import { handleFinish } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/handleFinish"

type Prescriptions = {
  appointmentId: Appointment['id'];
  doctorId: Doctor['id'];
  patientId: User['id'];
}

export default function Prescriptions({ appointmentId, doctorId, patientId }: Prescriptions) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const {
    history,
    diagnosis,
    laboratories,
    medicines,
    radiologies,

    //  Prescriptions
    laboratory,
    radiology,
    medicine,
    reset
  } = useConsultationStore(appointmentId)

  const tabs = [
    { key: "laboratory", label: "Laboratory", data: laboratories },
    { key: "medicine", label: "Medicine", data: medicines },
    { key: "radiology", label: "Radiology", data: radiologies },
  ].filter((tab) => tab.data && tab.data.length > 0)

  if (tabs.length === 0) return null

  const handleFinishClick = async () => {
    if(!history || !diagnosis) return;
    await handleFinish({
      history,
      diagnosis,
      laboratories,
      radiologies,
      medicines,
      laboratory,
      radiology,
      medicine,
      appointmentId,
      doctorId,
      patientId,
      reset,
      setIsLoading,
    });
  };
  
  

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {" "}
      {/* Adjust 64px to match your header height */}
      <div className="flex-grow overflow-auto">
        <Tabs defaultValue={tabs[0].key} className="w-full">
          <TabsList>
            {tabs.map(({ key, label }) => (
              <TabsTrigger key={key} value={key} className="w-full">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(({ key, label, data }) => (
            <TabsContent key={key} value={key}>
              <Prescription
                appointmentId={appointmentId}
                context={key as "laboratory" | "medicine" | "radiology"}
                content={data}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="p-4 bg-background border-t">
        <LoadingBtn isLoading={isLoading} onClick={handleFinishClick} className="w-full">
          End seesion
        </LoadingBtn>
      </div>
    </div>
  )
}