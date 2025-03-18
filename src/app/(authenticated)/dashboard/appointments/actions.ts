"use server";

import db from "@/lib/db";
import {
  Appointment,
  appointment,
  doctor,
  user,
  User,
} from "@/lib/db/schema";
import { generateId } from "@/lib/funcs";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getAppointments = async (userId: User["id"], role: User["role"]) => {
  let appointments;

  if (role == "admin") {
    appointments = await db.select().from(appointment);
  }

  if (role == "user") {
    appointments = await db
      .select()
      .from(appointment)
      .where(eq(appointment.patientId, userId));
  }

  if (role == "doctor") {
    const [doctorData] = await db
      .select()
      .from(doctor)
      .where(eq(doctor.userId, userId));

    appointments = await db
      .select()
      .from(appointment)
      .where(eq(appointment.doctorId, doctorData.id));
  }

  if (role == "receptionist") {
    const [receptionistData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    appointments = await db
      .select()
      .from(appointment)
      .where(eq(appointment.creatorId, receptionistData.id));
  }

  if (!appointments) throw new Error("Couldn't get appointmnets");

  return appointments.map((appointment) => ({
    id: appointment.id,
    date: format(appointment.startTime, "EEEE, d MMMM"), // Example format
    startTime: format(appointment.startTime, "HH:mm"),
    endTime: appointment.endTime
      ? format(appointment.endTime, "HH:mm")
      : "None",
    status: appointment.status,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    createdBy: appointment.createdBy,
    role: role,
  }));
};

export async function createAppointment({
  doctorId,
  patientId,
  createdBy,
  date,
  status = "pending",
  creatorId,
}: {
  doctorId: string;
  patientId: string;
  createdBy: Appointment["createdBy"];
  status: Appointment["status"];
  date: Date;
  creatorId: User["id"];
}) {
  try {
    const [createdAppointment] = await db
      .insert(appointment)
      .values({
        id: generateId(),
        patientId: patientId,
        doctorId: doctorId,
        creatorId: creatorId,
        startTime: date,
        status: status,
        createdBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: appointment.id });

    if (!createdAppointment.id) throw new Error("Failed to create appointment");

    if (createdAppointment) {
      revalidatePath("/dashboard/appointments");
      return {
        error: null,
        message: "Appointment Created Successfuly",
        appointmentId: createdAppointment.id,
      };
    }
  } catch (error: any) {
    return {
      error: error.message,
      message: null,
      appointmentId: null,
    };
  }
}

export async function updateAppointmentStatus({
  appointmentId,
  status,
}: {
  appointmentId: Appointment["id"];
  status: Appointment["status"];
}) {
  const [updatedAppointment] = await db
    .update(appointment)
    .set({
      status: status,
    })
    .where(eq(appointment.id, appointmentId))
    .returning({ id: appointment.id });

  if (!updatedAppointment.id)
    return {
      error: "Failed to update appointment status!",
    };

  return {
    message: `Appointment Status Updated To ${status}`,
    error: null,
  };
}

export async function updateAppointmentEndTime({
  appointmentId,
  date,
}: {
  appointmentId: Appointment["id"];
  date: Date;
}) {
  const [updatedAppointment] = await db
    .update(appointment)
    .set({
      endTime: date,
    })
    .returning();

  if (!updatedAppointment.id)
    return {
      error: "Couldn't update the end time!",
    };

  return {
    appointmentId: updatedAppointment.id,
    message: "End time updated!!",
    error: null,
  };
}
