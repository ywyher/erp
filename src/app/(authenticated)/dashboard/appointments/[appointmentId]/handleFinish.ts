import { createConsultation, createPrescription, updateConsultation, updatePrescription } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/actions"
import { updateAppointmentEndTime, updateAppointmentStatus } from "@/app/(authenticated)/dashboard/appointments/actions"
import { toast } from "sonner"
import { redirect, useRouter } from "next/navigation"
import { Prescription } from "@/lib/db/schema"

type HandleFinishParams = {
  history: string
  diagnosis: string
  laboratories: string[]
  radiologies: string[]
  medicines: string[]
  laboratory: string | null
  radiology: string | null
  medicine: string | null
  appointmentId: string
  doctorId: string
  patientId: string
  reset: () => void
  setIsLoading: (loading: boolean) => void
}

export const handleFinish = async ({
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
  consultationId,
  prescriptions
}: HandleFinishParams & { operation: 'create' | 'update', consultationId?: string, prescriptions?: Prescription[] }) => {
  if (!history || !diagnosis) return;

  setIsLoading(true);

  const consultationData = { history, diagnosis, laboratories, radiologies, medicines };

  let consultationResult;
  if (operation === 'create') {
    consultationResult = await createConsultation({
      data: consultationData,
      appointmentId,
      doctorId,
      patientId,
    });
  } else if (operation === 'update' && consultationId) {
    consultationResult = await updateConsultation({
      data: consultationData,
      consultationId,
    });
  }

  if (!consultationResult?.id || consultationResult.error) {
    toast.error(consultationResult?.error);
    setIsLoading(false);
    return;
  }

  // Create or update prescriptions for each category if they exist
  const prescriptionPromises = [];

  if (laboratory) {
    const existingPrescription = prescriptions?.find(p => p.type === "laboratory");
    if (existingPrescription) {
      prescriptionPromises.push(
        updatePrescription({
          content: laboratory,
          prescriptionId: existingPrescription.id,
        })
      );
    } else {
      prescriptionPromises.push(
        createPrescription({
          content: laboratory,
          type: "laboratory",
          appointmentId,
          doctorId,
          consultationId: consultationResult.id,
          patientId,
        })
      );
    }
  }

  if (radiology) {
    const existingPrescription = prescriptions?.find(p => p.type === "radiology");
    if (existingPrescription) {
      prescriptionPromises.push(
        updatePrescription({
          content: radiology,
          prescriptionId: existingPrescription.id,
        })
      );
    } else {
      prescriptionPromises.push(
        createPrescription({
          content: radiology,
          type: "radiology",
          appointmentId,
          doctorId,
          consultationId: consultationResult.id,
          patientId,
        })
      );
    }
  }

  if (medicine) {
    const existingPrescription = prescriptions?.find(p => p.type === "medicine");
    if (existingPrescription) {
      prescriptionPromises.push(
        updatePrescription({
          content: medicine,
          prescriptionId: existingPrescription.id,
        })
      );
    } else {
      prescriptionPromises.push(
        createPrescription({
          content: medicine,
          type: "medicine",
          appointmentId,
          doctorId,
          consultationId: consultationResult.id,
          patientId,
        })
      );
    }
  }

  const results = await Promise.all(prescriptionPromises);
  const errors = results.filter((res: any) => res.error);

  if (errors.length > 0) {
    toast.error("Some prescriptions failed to be created or updated!");
    setIsLoading(false);
    return;
  }

  const updatedStatus = await updateAppointmentStatus({ appointmentId, status: "completed" });

  if (updatedStatus.error) {
    toast.error(updatedStatus.error);
    setIsLoading(false);
    return;
  }

  const updatedEndTime = await updateAppointmentEndTime({ appointmentId, date: new Date() });

  if (updatedEndTime.error) {
    toast.error(updatedEndTime.error);
    setIsLoading(false);
    return;
  }

  toast.success("Consultation and prescriptions processed successfully!");
  reset();
  setIsLoading(false);

  redirect('/dashboard/appointments')
};