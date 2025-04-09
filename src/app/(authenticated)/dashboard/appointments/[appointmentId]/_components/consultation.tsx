"use client";

import { handleFinishConsultation } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/handle-finish-consultation";
import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store";
import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types";
import {
  laboratories as laboratoriesConst,
  radiologies as radiologiesConst,
  medicines as medicinesConst,
} from "@/app/(authenticated)/dashboard/constants";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import LoadingBtn from "@/components/loading-btn";
import {
  Form,
} from "@/components/ui/form";
import type {
  Appointment,
  Consultation,
  Doctor,
  Prescription,
  User,
} from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import DateSelector from "@/components/date-selector";
import { toast } from "sonner";

const normalizeText = (text: string) =>
  text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function Consultation({
  appointmentId,
  doctorId,
  patientId,
  consultationId,
  prescriptions,
  operation,
  setActiveTab,
  editable,
  creatorId,
}: {
  appointmentId: Appointment["id"];
  doctorId: Doctor["id"];
  patientId: User["id"];
  consultationId?: Consultation["id"];
  prescriptions?: Prescription[];
  operation: "update" | "create";
  setActiveTab: Dispatch<
    SetStateAction<"user" | "prescriptions" | "consultation">
  >;
  editable: boolean;
  creatorId: User["id"];
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [dataSelectorDialogOpen, setDataSelectorDialogOpen] =
    useState<boolean>(false);
  const [operationDate, setOperationDate] = useState<Date | null>(null);

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

    reset,
  } = useConsultationStore(appointmentId);

  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
  });

  const handleConsultation = async (
    data: z.infer<typeof consultationSchema>,
  ) => {
    setIsLoading(true);
    setHistory(data.history);
    setDiagnosis(data.diagnosis);

    const newSelectedPrescriptions: string[] = [];

    setLaboratories(data.laboratories);
    setLaboratory(data.laboratories.map(normalizeText).join("\n"));
    if (data.laboratories.length > 0) {
      newSelectedPrescriptions.push("laboratory");
    }

    setMedicines(data.medicines);
    setMedicine(data.medicines.map(normalizeText).join("\n"));
    if (data.medicines.length > 0) {
      newSelectedPrescriptions.push("medicine");
    }

    setRadiologies(data.radiologies);
    setRadiology(data.radiologies.map(normalizeText).join("\n"));
    if (data.radiologies.length > 0) {
      newSelectedPrescriptions.push("radiology");
    }

    setSelectedPrescriptions(newSelectedPrescriptions);
    setIsLoading(false);
    toast.message("Consultation data saved!");

    // Show alert if no prescriptions are selected
    if (newSelectedPrescriptions.length === 0) {
      setShowAlert(true); // Show the alert dialog
    } else {
      setActiveTab("prescriptions");
    }
  };

  const handleFinish = useCallback(async () => {
    const data = form.getValues();
    await handleFinishConsultation({
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
      operation,
      consultationId: consultationId || "",
      prescriptions: prescriptions || [],

      // Creation of the operation
      isCreateOperation: operationDate ? true : false,
      operationDate: operationDate,
      creatorId,
    });
    setShowAlert(false); // Close the alert dialog
  }, [form, appointmentId, consultationId, creatorId, doctorId, operation, operationDate, patientId, prescriptions, reset]);

  useEffect(() => {
    form.reset({
      diagnosis: diagnosis || "",
      history: history || "",
      laboratories,
      radiologies,
      medicines,
    });
  }, [history, diagnosis, laboratories, radiologies, medicines, form]);

  useEffect(() => {
    if (operationDate) {
      handleFinish();
    }
  }, [operationDate, handleFinish]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleConsultation)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <FormFieldWrapper
              form={form}
              name="history"
              label="History"
              type="textarea"
              disabled={!editable}
            />
            <FormFieldWrapper
              form={form}
              name="diagnosis"
              label="Diagnosis"
              type="textarea"
              disabled={!editable}
            />
            <FormFieldWrapper
              form={form}
              name="laboratories"
              label="Laboratories"
              type="multi-select"
              options={laboratoriesConst}
              disabled={!editable}
            />
            <FormFieldWrapper
              form={form}
              name="radiologies"
              label="Radiologies"
              type="multi-select"
              options={radiologiesConst}
              disabled={!editable}
            />
            <FormFieldWrapper
              form={form}
              name="medicines"
              label="Medicines"
              type="multi-select"
              options={medicinesConst}
              disabled={!editable}
            />
          </div>
          {editable && (
            <LoadingBtn isLoading={isLoading}>
              {operation == "create" ? "Save" : "Update"} Consultation
            </LoadingBtn>
          )}
        </form>
      </Form>

      {editable && (
        <>
          <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
            <AlertDialogContent>
              <AlertDialogHeader>
                {operation == "create" ? (
                  <AlertDialogTitle>
                    Do you want to reserve a operation for this appointment ?
                  </AlertDialogTitle>
                ) : (
                  <AlertDialogTitle>Are you sure!</AlertDialogTitle>
                )}
                <AlertDialogDescription>
                  This will save the consultation and end the session. You
                  cannot undo this action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {operation == "create" && (
                  <AlertDialogAction asChild onClick={handleFinish}>
                    <Button variant="secondary">No</Button>
                  </AlertDialogAction>
                )}
                <AlertDialogAction
                  asChild
                  onClick={() => {
                    if (operation == "update") {
                      handleFinish();
                    }
                  }}
                >
                  {operation == "create" ? (
                    <Button onClick={() => setDataSelectorDialogOpen(true)}>
                      Yes
                    </Button>
                  ) : (
                    <Button>End Session</Button>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <DateSelector
            onOpenChange={(open) => setDataSelectorDialogOpen(open)}
            open={dataSelectorDialogOpen}
            setDate={setOperationDate}
          />
        </>
      )}
    </>
  );
}
