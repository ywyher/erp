"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Consultation from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/consultation"
import UserMedicalFiles from "@/app/(authenticated)/dashboard/_components/user-data/medical-files"
import type { Appointment, Consultation as TConsultation, Doctor, MedicalFile, Prescription, User } from "@/lib/db/schema"
import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store"
import { useEffect, useState } from "react"
import Prescriptions from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/prescriptions/page"
import UserData from "@/app/(authenticated)/dashboard/_components/user-data/user-data"

type AppointmentTabs = {
  patient: User
  medicalFiles: MedicalFile[]
  appointmentId: Appointment["id"]
  doctorId: Doctor["id"]
  operation: 'update' | 'create'
  consultation?: TConsultation
  prescriptions?: Prescription[]
  editable: boolean
  creatorId: User['id']
}

export default function AppointmentTabs({ 
   patient,
   medicalFiles,
   appointmentId,
   doctorId,
   operation,
   consultation,
   prescriptions,
   editable,
   creatorId
   }: AppointmentTabs) {
  const { selectedPrescriptions } = useConsultationStore(appointmentId); // Invoke the Zustand store function
  const [activeTab, setActiveTab] = useState<"user" | "prescriptions" | "consultation">("user")
  const { 
     setDiagnosis,
     setHistory,
     setLaboratories,
     setRadiologies,
     setMedicines,
     setSelectedPrescriptions,
     setLaboratory,
     setRadiology,
     setMedicine 
    } = useConsultationStore(appointmentId);

  useEffect(() => {
    if (operation === 'update' && consultation) {
      setDiagnosis(consultation.diagnosis);
      setHistory(consultation.history);
      setLaboratories(consultation.laboratories ? consultation.laboratories.split(', ') : []);
      setRadiologies(consultation.radiologies ? consultation.radiologies.split(', ') : []);
      setMedicines(consultation.medicines ? consultation.medicines.split(', ') : []);

      const selectedPrescriptions = [];
      if (consultation.laboratories) selectedPrescriptions.push("laboratory");
      if (consultation.radiologies) selectedPrescriptions.push("radiology");
      if (consultation.medicines) selectedPrescriptions.push("medicine");
      setSelectedPrescriptions(selectedPrescriptions);

      prescriptions?.forEach(prescription => {
        switch (prescription.type) {
          case "laboratory":
            setLaboratory(prescription.content);
            break;
          case "radiology":
            setRadiology(prescription.content);
            break;
          case "medicine":
            setMedicine(prescription.content);
            break;
          default:
            break;
        }
      });
    }
  }, [operation, consultation, prescriptions, setDiagnosis, setHistory, setLaboratories, setRadiologies, setMedicines, setSelectedPrescriptions, setLaboratory, setRadiology, setMedicine]);

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
        <UserData user={patient} />
        <UserMedicalFiles files={medicalFiles} />
      </TabsContent>
      <TabsContent value="consultation">
        <Consultation
         appointmentId={appointmentId}
         doctorId={doctorId} patientId={patient.id}
         operation={operation}
         consultationId={consultation?.id}
         prescriptions={prescriptions}
         setActiveTab={setActiveTab}
         editable={editable}
         creatorId={creatorId}
        />
      </TabsContent>
      {selectedPrescriptions.length > 0 && (
        <TabsContent value="prescriptions">
          <Prescriptions 
            appointmentId={appointmentId} 
            doctorId={doctorId}
            patientId={patient.id}
            operation={operation}
            consultationId={consultation?.id}
            prescriptions={prescriptions}
            editable={editable}
            creatorId={creatorId}
          />
        </TabsContent>
      )}
    </Tabs>
  )
}