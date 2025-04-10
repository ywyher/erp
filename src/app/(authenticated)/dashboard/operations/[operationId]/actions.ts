"use server"

import db from "@/lib/db/index";
import {
  consultation as consultationTable,
  doctor,
  Doctor,
  Preset,
  preset,
  User,
} from "@/lib/db/schema";
import { medicalFile } from "@/lib/db/schema/medical-file";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getPreset = async ({ presetId }: { presetId: Preset['id'] }) =>{ 
  const [presetData] = await db.select().from(preset).where(eq(preset.id, presetId))

  return presetData
}

export const getPresets = async ({ doctorId }: { doctorId: Doctor['id'] }) => {
  return await db.select().from(preset).where(eq(preset.doctorId, doctorId))
}

export const getDoctorData = async ({ userId }: { userId: User['id'] }) => {
  const [doctorData] = await db.select().from(doctor).where(eq(doctor.userId, userId))
  
  return doctorData;
}

export const getPatientData = async (operationId: string) => {
  const operation = await db.query.operation.findFirst({
    columns: {
      id: true,
      patientId: true,
      doctorId: true,
      appointmentId: true,
    },
    where: (operation, { eq }) => eq(operation.id, operationId),
  });

  if (!operation) redirect("/dashboard/operations");

  const consultation = operation.appointmentId
    ? await db
        .select()
        .from(consultationTable)
        .where(eq(consultationTable.appointmentId, operation.appointmentId))
    : null;

  const patient = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, operation.patientId),
  });

  const operationDataVar = await db.query.operationData.findFirst({
    where: (operationData, { eq }) =>
      eq(operationData.operationId, operation.id),
  });

  let medicalFiles;

  if (operation.appointmentId) {
    medicalFiles = await db
      .select()
      .from(medicalFile)
      .where(
        and(
          eq(medicalFile.patientId, operation.patientId),
          eq(medicalFile.appointmentId, operation.appointmentId),
        ),
      );
  }

  if (!patient) return;

  return {
    patient,
    medicalFiles: medicalFiles || null,
    consultation:
      consultation && consultation.length > 0 ? consultation[0] : undefined,
    operationData: operationDataVar,
  };
};