"use server";

import db from "@/lib/db";
import {
  appointment,
  Appointment,
  doctor,
  medicalFile,
  User,
  user,
} from "@/lib/db/schema";
import { generateId } from "@/lib/funcs";
import { eq } from "drizzle-orm";

export const getAppointment = async (appointmentId: Appointment["id"]) => {
  const [appointmentData] = await db
    .select({
      appointment: appointment,
      doctor: {
        ...doctor,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          nationalId: user.nationalId,
          phoneNumberVerified: user.phoneNumberVerified,
          emailVerified: user.emailVerified,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    })
    .from(appointment)
    .leftJoin(doctor, eq(doctor.id, appointment.doctorId))
    .leftJoin(user, eq(user.id, doctor.userId))
    .where(eq(appointment.id, appointmentId));

  return appointmentData;
};

export const saveMedicalFilesInDb = async ({
  appointmentId,
  name,
  type,
  patientId,
}: {
  appointmentId: Appointment["id"];
  name: string;
  type: File["type"];
  patientId: User["id"];
}) => {
  if (!name || !type) {
    return {
      error: "Invalid file",
    };
  }

  const [file] = await db
    .insert(medicalFile)
    .values({
      id: generateId(),
      name: name,
      type: type,
      patientId: patientId,
      appointmentId: appointmentId,
    })
    .returning();

  return {
    error: null,
    message: "Files uploaded successfully",
    file,
  };
};
