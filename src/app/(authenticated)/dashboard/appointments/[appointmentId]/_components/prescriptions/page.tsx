'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store"
import { Consultation, Doctor, Prescription as TPrescription, User, type Appointment } from "@/lib/db/schema"
import Prescription from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/prescriptions/prescription"
import { useState } from "react"
import { useRouter } from "next/navigation"
import LoadingBtn from "@/components/loading-btn"
import { handleFinish } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/handleFinish"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Prescriptions = {
  appointmentId: Appointment['id'];
  doctorId: Doctor['id'];
  patientId: User['id'];
  operation: 'update' | 'create'
  consultationId?: Consultation['id']
  prescriptions?: TPrescription[]
  editable: boolean
}

export default function Prescriptions({ 
   appointmentId,
   doctorId,
   patientId,
   operation,
   consultationId,
   prescriptions,
   editable
  }: Prescriptions) {
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
      operation,
      consultationId: consultationId,
      prescriptions: prescriptions
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
                editable={editable}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {editable ? (
        <div className="p-4 bg-background border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full">End session</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction  onClick={handleFinishClick}>
                    Proceed
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ): (
        <Button className="w-full" onClick={() => router.push('/dashboard/appointments')}>Done</Button>
      )}
    </div>
  )
}