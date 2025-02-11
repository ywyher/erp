import AppointmentTabs from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/tabs"
import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { Consultation, Doctor, MedicalFile, Prescription, medicalFile as TMedicalFile, User } from "@/lib/db/schema"
import { medicalFile } from "@/lib/db/schema/medical-file"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const getUserData = async (appointmentId: string) => {
    const appointment = await db.query.appointment.findFirst({
        columns: {
            id: true,
            patientId: true,
            doctorId: true,
        },
        where: (appointment, { eq }) => eq(appointment.id, appointmentId)
    })

    if (!appointment) redirect('/dashboard/appointments');

    const consultation = await db.query.consultation.findFirst({
        where: (consultation, { eq }) => eq(consultation.appointmentId, appointmentId)
    })

    const prescriptions = consultation ? await db.query.prescription.findMany({
        where: (prescription, { eq }) => eq(prescription.consultationId, consultation.id)
    }) : [];

    const user = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, appointment.patientId)
    })

    const medicalFiles = await db.select().from(medicalFile)
        .where(and(eq(medicalFile.patientId, appointment.patientId), eq(medicalFile.appointmentId, appointmentId)))

    if (!user) return;

    return {
        user,
        doctorId: appointment.doctorId,
        medicalFiles: medicalFiles || null,
        operation: consultation?.id ? 'update' : 'create',
        consultation,
        prescriptions
    };
}

export default async function Appointment({ params: { appointmentId } }: { params: { appointmentId: string } }) {
    const { user, medicalFiles, doctorId, operation, consultation, prescriptions } = await getUserData(appointmentId) as {
         user: User,
         doctorId: Doctor['id'],
         medicalFiles: MedicalFile[],
         operation: 'update' | 'create';
         consultation?: Consultation;
         prescriptions?: Prescription[];
    };

    const { data } = await getSession({
        fetchOptions: {
            headers: await headers(),
        },
    });
    
    if(!data || !data.user) {
        return new Error("Couldn't retrieve data")
    }
    
    return (
        <AppointmentTabs 
            user={user}
            medicalFiles={medicalFiles}
            appointmentId={appointmentId}
            doctorId={doctorId}
            operation={operation}
            consultation={consultation}
            prescriptions={prescriptions}
            editable={data.user.role == 'doctor' ? true : false}
        />
    )
}