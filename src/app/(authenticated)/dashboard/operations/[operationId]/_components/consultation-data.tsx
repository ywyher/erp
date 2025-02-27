"use client";

import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Consultation } from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function ConsultationData({
  consultation,
}: {
  consultation: Consultation;
}) {
  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      diagnosis: consultation.diagnosis,
      history: consultation.diagnosis,
    },
  });

  useEffect(() => {
    if (consultation.laboratories && consultation.laboratories?.length > 0) {
      form.setValue("laboratories", consultation.laboratories.split(","));
    }
    if (consultation.radiologies && consultation.radiologies?.length > 0) {
      form.setValue("radiologies", consultation.radiologies.split(","));
    }
    if (consultation.medicines && consultation.medicines?.length > 0) {
      form.setValue("medicines", consultation.medicines.split(","));
    }
  }, [consultation]);

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((e) => console.log(e))}>
          <div className="flex flex-col gap-2">
            <FormFieldWrapper
              form={form}
              disabled
              name="history"
              label="History"
              type="textarea"
            />
            <FormFieldWrapper
              form={form}
              disabled
              name="diagnosis"
              label="Diagnosis"
            />
            {consultation.laboratories &&
              consultation.laboratories.length > 0 && (
                <FormFieldWrapper
                  form={form}
                  name="laboratories"
                  label="Laboratories"
                  type="multi-select"
                  disabled
                  options={consultation.laboratories
                    ?.split(", ")
                    .map((lab) => ({
                      value: lab.toLowerCase(),
                      label: lab.charAt(0).toUpperCase() + lab.slice(1),
                    }))}
                />
              )}
            {consultation.radiologies &&
              consultation.radiologies.length > 0 && (
                <FormFieldWrapper
                  form={form}
                  name="radiologies"
                  label="Radiologies"
                  type="multi-select"
                  disabled
                  options={consultation.radiologies?.split(", ").map((rad) => ({
                    value: rad.toLowerCase(),
                    label: rad.charAt(0).toUpperCase() + rad.slice(1),
                  }))}
                />
              )}
            {consultation.medicines && consultation.medicines.length > 0 && (
              <FormFieldWrapper
                form={form}
                name="medicines"
                label="Medicines"
                type="multi-select"
                disabled
                options={consultation.medicines?.split(", ").map((med) => ({
                  value: med.toLowerCase(),
                  label: med.charAt(0).toUpperCase() + med.slice(1),
                }))}
              />
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
