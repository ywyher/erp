import { appointmentTableColumns } from "@/app/(authenticated)/dashboard/appointments/columns";
import { operationTableColumns } from "@/app/(authenticated)/dashboard/operations/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db"
import { appointment, doctor, operation, receptionist, User } from "@/lib/db/schema"
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";

const listAppointments = async (userId: User['id'], role: User['role']) => {
    let operations;

    if (role == 'admin') {
        operations = await db.select().from(operation)
    }

    if (role == 'user') {
        operations = await db.select().from(operation)
            .where(eq(operation.patientId, userId))
    }

    if (role == 'doctor') {
        const [doctorData] = await db.select().from(doctor)
            .where(eq(doctor.userId, userId))

        operations = await db.select().from(operation)
            .where(eq(operation.doctorId, doctorData.id))
    }

    if (role == 'receptionist') {
        const [receptionistData] = await db.select().from(receptionist)
            .where(eq(receptionist.userId, userId))

        operations = await db.select().from(operation)
            .where(eq(operation.receptionistId, receptionistData.id))
    }

    if (!operations) throw new Error("Couldn't get appointmnets")

    return operations.map(operation => ({
        id: operation.id,
        date: format(operation.startTime, 'EEEE, d MMMM'), // Example format
        startTime: format(operation.startTime, 'HH:mm'),
        endTime: format(operation.endTime, 'HH:mm'),
        status: operation.status,
        patientId: operation.patientId,
        doctorId: operation.doctorId,
        createdBy: operation.createdBy,
        type: operation.type,
        role: role,
    }));
}

export default async function Operations() {

    const { data } = await getSession({
        fetchOptions: {
            headers: await headers()
        }
    })

    if (!data) throw new Error('Unauthorized');

    const operations = await listAppointments(data.user.id, data.user.role as User['role'])

    return (
        <div className="w-[100%]">
            {operations && (
                <>
                    <DataTable columns={operationTableColumns} data={operations} filter={null} />
                    <Button>
                        <Link href="/dashboard/operations/create">
                            Create Operation
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}