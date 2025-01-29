"use client"

import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store"
import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types"
import {
  laboratories as laboratoriesConst,
  radiologies as radiologiesConst,
  medicines as medicinesConst,
} from "@/app/(authenticated)/dashboard/constants"
import { FormFieldWrapper } from "@/components/formFieldWrapper"
import LoadingBtn from "@/components/loading-btn"
import { Button } from "@/components/ui/button"
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import MultipleSelector, { Option } from "@/components/ui/multi-select"
import type { Appointment, Doctor, User } from "@/lib/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

export default function Consultation({
  appointmentId,
  doctorId,
  patientId,
  setHasPrescriptions
}: {
  appointmentId: Appointment["id"]
  doctorId: Doctor["id"]
  patientId: User["id"]
  setHasPrescriptions: Dispatch<SetStateAction<boolean>>
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
  } = useConsultationStore(appointmentId)


  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      history: history || "",
      diagnosis: diagnosis || "",
      laboratories: laboratories || [],
      radiologies: radiologies || [],
      medicines: medicines || [],
    },
  })

  const handleConsultation = async (data: z.infer<typeof consultationSchema>) => {
    setIsLoading(true)
    setHistory(data.history)
    setDiagnosis(data.diagnosis)

    const hasLaboratories = data.laboratories && data.laboratories.length > 0
    const hasMedicines = data.medicines && data.medicines.length > 0
    const hasRadiologies = data.radiologies && data.radiologies.length > 0

    if (hasLaboratories) {
      setLaboratories(data.laboratories)
    }
    if (hasMedicines) {
      setMedicines(data.medicines)
    }
    if (hasRadiologies) {
      setRadiologies(data.radiologies)
    }

    if (hasLaboratories || hasMedicines || hasRadiologies) {
      console.log("Setting hasPrescriptions to true")
      setHasPrescriptions(true)
    } else {
      console.log("Setting hasPrescriptions to false")
      setHasPrescriptions(false)
    }

    setIsLoading(false)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleConsultation)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FormFieldWrapper form={form} defaultValue={history} name="history" label="History" type="textarea" />
            <FormFieldWrapper form={form} defaultValue={diagnosis} name="diagnosis" label="Diagnosis" />
            <FormFieldWrapper
              form={form}
              name="laboratories"
              label="Laboratories"
              type="multi-select"
              options={laboratoriesConst}
              defaultValue={laboratories.map((val) => ({ value: val, label: val }))}
            />
            <FormFieldWrapper
              form={form}
              name="radiologies"
              label="Radiologies"
              type="multi-select"
              options={radiologiesConst}
              defaultValue={radiologies.map((val) => ({ value: val, label: val }))}
            />
            <FormFieldWrapper
              form={form}
              name="medicines"
              label="Medicines"
              type="multi-select"
              options={medicinesConst}
              defaultValue={medicines.map((val) => ({ value: val, label: val }))}
            />
          </div>
          <LoadingBtn isLoading={isLoading}>Submit Consultation</LoadingBtn>
        </form>
      </Form>
    </>
  )
}