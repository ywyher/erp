import { createConsultation, createPrescription, updateConsultation, updatePrescription } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/actions"
import { updateAppointmentEndTime, updateAppointmentStatus } from "@/app/(authenticated)/dashboard/appointments/actions"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import { Prescription, User } from "@/lib/db/schema"
import { createOperation } from "@/app/(authenticated)/dashboard/operations/actions"

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
  isCreateOperation: boolean
  operationDate: Date | null
  reset: () => void
  setIsLoading: (loading: boolean) => void
  creatorId?: User['id']
}

type HandlePrescriptionParams = {
  prescriptions?: Prescription[]
  appointmentId: string
  doctorId: string
  patientId: string
  consultationId: string
  laboratory: string | null
  radiology: string | null
  medicine: string | null
}

const handlePrescriptions = async ({
  prescriptions,
  appointmentId,
  doctorId,
  patientId,
  consultationId,
  laboratory,
  radiology,
  medicine
}: HandlePrescriptionParams) => {
  const prescriptionPromises = [];

  const processPrescription = async (type: "laboratory" | "radiology" | "medicine", content: string | null) => {
    if (!content) return;
    const existingPrescription = prescriptions?.find(p => p.type === type);
    
    if (existingPrescription) {
      return updatePrescription({
        content,
        prescriptionId: existingPrescription.id,
      });
    } else {
      return createPrescription({
        content,
        type,
        appointmentId,
        doctorId,
        consultationId,
        patientId,
      });
    }
  };

  prescriptionPromises.push(processPrescription("laboratory", laboratory));
  prescriptionPromises.push(processPrescription("radiology", radiology));
  prescriptionPromises.push(processPrescription("medicine", medicine));

  const results = await Promise.all(prescriptionPromises);
  const errors = results.filter(res => res?.error);

  if (errors.length > 0) {
    toast.error("Some prescriptions failed to be created or updated!");
    return false;
  }
  
  return true;
};

export const handleFinishConsultation = async ({
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
  prescriptions,
  isCreateOperation,
  operationDate,
  creatorId
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

  // Handle prescriptions using the new function
  const prescriptionsSuccess = await handlePrescriptions({
    prescriptions,
    appointmentId,
    doctorId,
    patientId,
    consultationId: consultationResult.id,
    laboratory,
    radiology,
    medicine
  });

  if (!prescriptionsSuccess) {
    setIsLoading(false);
    return;
  }

  // Update appointment status & end time
  const [updatedStatus, updatedEndTime] = await Promise.all([
    updateAppointmentStatus({ appointmentId, status: "completed" }),
    updateAppointmentEndTime({ appointmentId, date: new Date() }),
  ]);

  if (updatedStatus.error) {
    toast.error(updatedStatus.error);
    setIsLoading(false);
    return;
  }

  if (updatedEndTime.error) {
    toast.error(updatedEndTime.error);
    setIsLoading(false);
    return;
  }

  // Create an operation if applicable
  if (operation === 'create' && isCreateOperation && operationDate && creatorId) {
    const createdOperation = await createOperation({ 
      createdBy: 'doctor',
      creatorId,
      doctorId,
      patientId,
      date: operationDate,
      status: 'pending',
      appointmentId
    });

    if (createdOperation?.error) {
      toast.error(createdOperation.error);
      setIsLoading(false);
      return;
    }
  }

  toast.success("Consultation and prescriptions processed successfully!");
  reset();
  setIsLoading(false);
  redirect('/dashboard/appointments');
};