'use server'

import { PrescriptionTypes } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/types";
import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types";
import db from "@/lib/db";
import { Appointment, Consultation, Doctor, prescription, User } from "@/lib/db/schema";
import { consultation } from "@/lib/db/schema/consultation";
import { generateId } from "@/lib/funcs";
import { eq } from "drizzle-orm";
import { z } from "zod";

type CreateConsultation = {
  data: z.infer<typeof consultationSchema>,
  appointmentId: Appointment['id']
  doctorId: Doctor['id']
  patientId: User['id']
}

export async function createConsultation({ 
   data,
   appointmentId,
   doctorId,
   patientId
  }: CreateConsultation) {
  const consultationId = generateId();

  // Convert arrays to comma-separated strings
  const laboratoriesString = data.laboratories.join(',');
  const radiologiesString = data.radiologies.join(',');
  const medicinesString = data.medicines.join(',');

  const [creation] = await db.insert(consultation).values({
      id: consultationId,     
      appointmentId: appointmentId,
      doctorId: doctorId,
      patientId: patientId,
      diagnosis: data.diagnosis,
      history: data.history,
      laboratories: laboratoriesString, // Use the converted string
      radiologies: radiologiesString,   // Use the converted string
      medicines: medicinesString,       // Use the converted string
      createdAt: new Date(),
      updatedAt: new Date(),
  }).returning({ id: consultation.id });

  if(!creation.id) return { 
      error: "Couldn't create consultation"
  };

  return {
      id: creation.id,
      message: "Consultation created successfully",
      error: null,
  }
}

type CreatePrescription = {
  content: string;
  type: PrescriptionTypes;
  appointmentId: Appointment['id'];
  consultationId: Consultation['id'];
  doctorId: Doctor['id'];
  patientId: User['id']
}

export async function createPrescription({ 
    content,
    type,
    appointmentId,
    doctorId,
    consultationId,
    patientId 
  }: CreatePrescription) {

  const prescriptionId = generateId();

  const [createdPrescription] = await db.insert(prescription).values({
    id: prescriptionId,
    content: content,
    type: type,
    appointmentId: appointmentId,
    doctorId: doctorId,
    consultationId: consultationId,
    patientId: patientId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: prescription.id })

  if(!createdPrescription.id) return {
    error: "Failed to create prescription!"
  }

  return {
    message: 'Prescription Created Successfully',
    error: null
  }
}

type UpdateConsultation = {
  data: z.infer<typeof consultationSchema>,
  consultationId: Consultation['id']
}

export async function updateConsultation({ 
   data,
   consultationId
  }: UpdateConsultation) {
  // Convert arrays to comma-separated strings
  const laboratoriesString = data.laboratories.join(',');
  const radiologiesString = data.radiologies.join(',');
  const medicinesString = data.medicines.join(',');

  const [update] = await db.update(consultation).set({
      diagnosis: data.diagnosis,
      history: data.history,
      laboratories: laboratoriesString, // Use the converted string
      radiologies: radiologiesString,   // Use the converted string
      medicines: medicinesString,       // Use the converted string
      updatedAt: new Date(),
  }).where(eq(consultation.id, consultationId)).returning({ id: consultation.id });

  if(!update.id) return { 
      error: "Couldn't update consultation"
  };

  return {
      id: update.id,
      message: "Consultation updated successfully",
      error: null,
  }
}

type UpdatePrescription = {
  content: string;
  prescriptionId: string;
}

export async function updatePrescription({ 
    content,
    prescriptionId
  }: UpdatePrescription) {

  const [updatedPrescription] = await db.update(prescription).set({
    content: content,
    updatedAt: new Date(),
  }).where(eq(prescription.id, prescriptionId)).returning({ id: prescription.id })

  if(!updatedPrescription.id) return {
    error: "Failed to update prescription!"
  }

  return {
    message: 'Prescription Updated Successfully',
    error: null
  }
}