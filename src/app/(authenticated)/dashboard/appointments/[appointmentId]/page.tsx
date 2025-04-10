import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import AppointmentTabs from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/appointment-tabs";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db/index";
import {
  Appointment as TAppointment,
  Consultation,
  Doctor,
  MedicalFile,
  Prescription,
  User,
} from "@/lib/db/schema";
import { medicalFile } from "@/lib/db/schema/medical-file";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const getUserData = async (appointmentId: string) => {
  const appointment = await db.query.appointment.findFirst({
    columns: {
      id: true,
      patientId: true,
      doctorId: true,
    },
    where: (appointment, { eq }) => eq(appointment.id, appointmentId),
  });

  if (!appointment) redirect("/dashboard/appointments");

  const consultation = await db.query.consultation.findFirst({
    where: (consultation, { eq }) =>
      eq(consultation.appointmentId, appointmentId),
  });

  const prescriptions = consultation
    ? await db.query.prescription.findMany({
        where: (prescription, { eq }) =>
          eq(prescription.consultationId, consultation.id),
      })
    : [];

  const patient = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, appointment.patientId),
  });

  const medicalFiles = await db
    .select()
    .from(medicalFile)
    .where(
      and(
        eq(medicalFile.patientId, appointment.patientId),
        eq(medicalFile.appointmentId, appointmentId),
      ),
    );

  if (!patient) return;

  return {
    patient,
    doctorId: appointment.doctorId,
    medicalFiles: medicalFiles || null,
    operation: consultation?.id ? "update" : "create",
    consultation,
    prescriptions,
  };
};

type Params = Promise<{ appointmentId: TAppointment['id'] }>

export default async function Appointment({
  params,
}: {
  params: Params;
}) {
  const { appointmentId } = await params

  const {
    patient,
    medicalFiles,
    doctorId,
    operation,
    consultation,
    prescriptions,
  } = (await getUserData(appointmentId)) as {
    patient: User;
    doctorId: Doctor["id"];
    medicalFiles: MedicalFile[];
    operation: "update" | "create";
    consultation?: Consultation;
    prescriptions?: Prescription[];
  };

  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data || !data.user) {
    return new Error("Couldn't retrieve data");
  }

  return (
    <DashboardLayout>
      <AppointmentTabs
        patient={patient}
        medicalFiles={medicalFiles}
        appointmentId={appointmentId}
        doctorId={doctorId}
        operation={operation}
        consultation={consultation}
        prescriptions={prescriptions}
        editable={data.user.role == "doctor" ? true : false}
        creatorId={data.user.id}
      />
    </DashboardLayout>
  );
}
