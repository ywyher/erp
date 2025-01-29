'use server'

import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types";
import db from "@/lib/db";
import { Appointment, Doctor, User } from "@/lib/db/schema";
import { consultation } from "@/lib/db/schema/consultation";
import { generateId } from "@/lib/funcs";
import { z } from "zod";

type CreateConsultation = {
  data: z.infer<typeof consultationSchema>,
  appointmentId: Appointment['id']
  doctorId: Doctor['id']
  patientId: User['id']
}

export async function createConsultation({ data, appointmentId, doctorId, patientId }: CreateConsultation) {
  const consultationId = generateId();

  // Convert arrays to comma-separated strings
  const laboratoriesString = data.laboratories.join(', ');
  const radiologiesString = data.radiologies.join(', ');
  const medicinesString = data.medicines.join(', ');

  const creation = await db.insert(consultation).values({
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

  if(!creation[0].id) return { 
      error: "Couldn't create consultation"
  };

  return {
      message: "Consultation created successfully",
      error: null,
  }
}