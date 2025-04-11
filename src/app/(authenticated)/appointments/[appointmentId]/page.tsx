import AppointmentTabs from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/appointment-tabs";
import CardLayout from "@/components/card-layout";
import Header from "@/components/header";
import { auth } from "@/lib/auth";
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

  if (!appointment) redirect("/appointments");

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

  const medicalFiles = await db
    .select()
    .from(medicalFile)
    .where(
      and(
        eq(medicalFile.patientId, appointment.patientId),
        eq(medicalFile.appointmentId, appointmentId),
      ),
    );

  return {
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

  const data = await auth.api.getSession({
    headers: await headers()
  });

  if (!data || !data.user) {
    return new Error("Couldn't retrieve data");
  }

  const {
    medicalFiles,
    doctorId,
    operation,
    consultation,
    prescriptions,
  } = (await getUserData(appointmentId)) as {
    doctorId: Doctor["id"];
    medicalFiles: MedicalFile[];
    operation: "update" | "create";
    consultation?: Consultation;
    prescriptions?: Prescription[];
  };

  return (
    <>
      <Header />
      <CardLayout title="Appointment Details">
        <AppointmentTabs
          patient={data.user as User}
          medicalFiles={medicalFiles}
          appointmentId={appointmentId}
          doctorId={doctorId}
          operation={operation}
          consultation={consultation}
          prescriptions={prescriptions}
          editable={false}
          creatorId={data.user.id}
        />
      </CardLayout>
    </>
  );
}