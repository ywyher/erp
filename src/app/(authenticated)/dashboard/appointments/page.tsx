import { appointmentTableColumns } from "@/app/(authenticated)/dashboard/appointments/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db"
import { appointment, doctor, receptionist, User } from "@/lib/db/schema"
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";

const listAppointments = async (userId: User['id'], role: User['role']) => {
    let appointments;


    if (role == 'admin') {
        appointments = await db.select().from(appointment)
    }

    if (role == 'user') {
        appointments = await db.select().from(appointment)
            .where(eq(appointment.patientId, userId))
    }

    if (role == 'doctor') {
        const [doctorData] = await db.select().from(doctor)
            .where(eq(doctor.userId, userId))

        appointments = await db.select().from(appointment)
            .where(eq(appointment.doctorId, doctorData.id))
    }

    if (role == 'receptionist') {
        const [receptionistData] = await db.select().from(receptionist)
            .where(eq(receptionist.userId, userId))

        appointments = await db.select().from(appointment)
            .where(eq(appointment.receptionistId, receptionistData.id))
    }

    if (!appointments) throw new Error("Couldn't get appointmnets")

    return appointments.map(appointment => ({
        id: appointment.id,
        startTime: format(appointment.startTime, 'HH:mm'),
        endTime: format(appointment.endTime, 'HH:mm'),
        status: appointment.status,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        createdBy: appointment.createdBy
    }));
}

export default async function Appointments() {

    const { data } = await getSession({
        fetchOptions: {
            headers: await headers()
        }
    })

    if (!data) throw new Error('Unauthorized');

    const appointments = await listAppointments(data.user.id, data.user.role as User['role'])

    console.log(appointments)

    return (
        <div className="w-[100%]">
            {appointments && (
                <>
                    <DataTable columns={appointmentTableColumns} data={appointments} filter={null} />
                    <Button>
                        <Link href="/dashboard/appointments/create">
                            Create Appointment
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}
