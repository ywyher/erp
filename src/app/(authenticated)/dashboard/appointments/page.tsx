import { appointmentTableColumns } from "@/app/(authenticated)/dashboard/appointments/columns";
import { DataTable } from "@/components/ui/data-table";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db"
import { appointment, doctor, receptionist } from "@/lib/db/schema"
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const listAppointments = async () => {
    const appointments = await db.select().from(appointment)

    return appointments.map(appointment => ({
        id: appointment.id,
        startTime: format(appointment.startTime, 'HH:mm'),
        endTime: format(appointment.endTime, 'HH:mm'),
        status: appointment.status
    }));
}

const getUserId = async (role: 'doctor' | 'receptionist') => {
    const { data: session } = await getSession({
        fetchOptions: {
            headers: await headers()
        }
    })

    if (!session) throw new Error('Unauthorized');

    let userData
    if (role == 'doctor') {
        userData = await db.select().from(doctor)
            .where(eq(doctor.userId, session.user.id))
            .limit(1)
    }
    if (role == 'receptionist') {
        userData = await db.select().from(receptionist)
            .where(eq(receptionist.userId, session.user.id))
            .limit(1)
    }

    if (!userData) throw new Error('Unauthorized');

    return userData[0].id;
}

export default async function Appointments() {

    const { data } = await getSession({
        fetchOptions: {
            headers: await headers()
        }
    })

    if (!data || (data.user.role != 'doctor' && data.user.role != 'receptionist')) return redirect('/dashboard')

    const appointments = await listAppointments()

    return (
        <div className="w-[100%]">
            {appointments && (
                <>
                    <DataTable columns={appointmentTableColumns} data={appointments} filter={null} />
                </>
            )}
        </div>
    )
}
