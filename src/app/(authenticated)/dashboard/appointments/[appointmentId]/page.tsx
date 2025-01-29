import AppointmentTabs from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/tabs"
import db from "@/lib/db"
import { Doctor, MedicalFile, medicalFile as TMedicalFile, User } from "@/lib/db/schema"
import { medicalFile } from "@/lib/db/schema/medical-file"
import { and, eq } from "drizzle-orm"
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

    const user = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, appointment.patientId)
    })

    const medicalFiles = await db.select().from(medicalFile)
        .where(and(eq(medicalFile.patientId, appointment.patientId), eq(medicalFile.appointmentId, appointmentId)))

    if (!user) return;

    return {
        user,
        doctorId: appointment.doctorId,
        medicalFiles: medicalFiles || null
    };
}

export default async function Appointment({ params: { appointmentId } }: { params: { appointmentId: string } }) {
    const { user, medicalFiles, doctorId } = await getUserData(appointmentId) as { user: User, doctorId: Doctor['id'], medicalFiles: MedicalFile[] };

    return (
        <AppointmentTabs 
            user={user}
            medicalFiles={medicalFiles}
            appointmentId={appointmentId}
            doctorId={doctorId}
        />
    )
}