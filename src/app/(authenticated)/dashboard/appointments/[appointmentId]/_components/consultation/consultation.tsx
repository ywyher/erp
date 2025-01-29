"use client"

import { handleFinish } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/handleFinish"
import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store"
import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types"
import {
  laboratories as laboratoriesConst,
  radiologies as radiologiesConst,
  medicines as medicinesConst,
} from "@/app/(authenticated)/dashboard/constants"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from "@/components/ui/form"
import type { Appointment, Doctor, User } from "@/lib/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

export default function Consultation({
  appointmentId,
  doctorId,
  patientId,
}: {
  appointmentId: Appointment["id"]
  doctorId: Doctor["id"]
  patientId: User["id"]
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    history,
    diagnosis,
    laboratories,
    medicines,
    radiologies,
    setDiagnosis,
    setHistory,
    setLaboratories,
    setMedicines,
    setRadiologies,
    setSelectedPrescriptions,

    // Prescriptions
    setLaboratory,
    setMedicine,
    setRadiology,
    
    reset
  } = useConsultationStore(appointmentId);

  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      history: history || "",
      diagnosis: diagnosis || "",
    },
  })

  const normalizeText = (text: string) => 
    text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const handleConsultation = async (data: z.infer<typeof consultationSchema>) => {
    setIsLoading(true)
    setHistory(data.history)
    setDiagnosis(data.diagnosis)
    
    const newSelectedPrescriptions: string[] = []

    setLaboratories(data.laboratories);
    setLaboratory(data.laboratories.map(normalizeText).join('\n'));
    if (data.laboratories.length > 0) {
      newSelectedPrescriptions.push("laboratory");
    }
    
    setMedicines(data.medicines);
    setMedicine(data.medicines.map(normalizeText).join('\n'))
    if (data.medicines.length > 0) {
      newSelectedPrescriptions.push("medicine");
    }
    
    setRadiologies(data.radiologies);
    setRadiology(data.radiologies.map(normalizeText).join('\n'))
    if (data.radiologies.length > 0) {
      newSelectedPrescriptions.push("radiology");
    }
    
    setSelectedPrescriptions(newSelectedPrescriptions)
    setIsLoading(false)

    if (newSelectedPrescriptions.length === 0) {
      await handleFinish({
        history: data.history,
        diagnosis: data.diagnosis,
        laboratories: data.laboratories,
        radiologies: data.radiologies,
        medicines: data.medicines,
        laboratory: null,
        radiology: null,
        medicine: null,
        appointmentId,
        doctorId,
        patientId,
        reset,
        setIsLoading,
      });
    }

  }

  useEffect(() => {
    form.setValue("laboratories", laboratories);
    form.setValue("radiologies", radiologies);
    form.setValue("medicines", medicines);
  }, [laboratories, radiologies, medicines]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleConsultation)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FormFieldWrapper form={form} name="history" label="History" type="textarea" />
            <FormFieldWrapper form={form} name="diagnosis" label="Diagnosis" />
            <FormFieldWrapper
              form={form}
              name="laboratories"
              label="Laboratories"
              type="multi-select"
              options={laboratoriesConst}
            />
            <FormFieldWrapper
              form={form}
              name="radiologies"
              label="Radiologies"
              type="multi-select"
              options={radiologiesConst}
            />
            <FormFieldWrapper
              form={form}
              name="medicines"
              label="Medicines"
              type="multi-select"
              options={medicinesConst}
            />
          </div>
          <LoadingBtn isLoading={isLoading}>Submit Consultation</LoadingBtn>
        </form>
      </Form>
    </>
  )
}