import { createConsultation, createPrescription } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/actions"
import { updateAppointmentStatus } from "@/app/(authenticated)/dashboard/appointments/actions"
import { toast } from "sonner"
import { redirect, useRouter } from "next/navigation"

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
}: HandleFinishParams) => {
  if (!history || !diagnosis) return;

  setIsLoading(true);

  const consultationData = { history, diagnosis, laboratories, radiologies, medicines };

  const consultation = await createConsultation({
    data: consultationData,
    appointmentId,
    doctorId,
    patientId,
  });

  if (!consultation.id || consultation.error) {
    toast.error(consultation.error);
    setIsLoading(false);
    return;
  }

  // Create prescriptions for each category if they exist
  const prescriptionPromises = [];

  if (laboratory) {
    prescriptionPromises.push(
      createPrescription({
        content: laboratory,
        type: "laboratory",
        appointmentId,
        doctorId,
        consultationId: consultation.id,
        patientId,
      })
    );
  }

  if (radiology) {
    prescriptionPromises.push(
      createPrescription({
        content: radiology,
        type: "radiology",
        appointmentId,
        doctorId,
        consultationId: consultation.id,
        patientId,
      })
    );
  }

  if (medicine) {
    prescriptionPromises.push(
      createPrescription({
        content: medicine,
        type: "medicine",
        appointmentId,
        doctorId,
        consultationId: consultation.id,
        patientId,
      })
    );
  }

  const results = await Promise.all(prescriptionPromises);
  const errors = results.filter((res) => res.error);

  if (errors.length > 0) {
    toast.error("Some prescriptions failed to be created!");
    setIsLoading(false);
    return;
  }

  const updatedStatus = await updateAppointmentStatus({ appointmentId, status: "completed" });

  if (updatedStatus.error) {
    toast.error(updatedStatus.error);
    setIsLoading(false);
    return;
  }

  toast.success("Consultation and prescriptions created successfully!");
  reset();
  setIsLoading(false);

  redirect('/dashboard/appointments')
};