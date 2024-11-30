import CreateAppointment from "@/app/(authenticated)/dashboard/appointments/create/_components/create-appointment";
import { getSession, User } from "@/lib/auth-client"
import db from "@/lib/db";
import { doctor, receptionist } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers"
import { redirect } from "next/navigation";

const getUserId = async (data: User, role: 'doctor' | 'receptionist') => {
    if (!data) throw new Error('Unauthorized');

    let userData
    if (role == 'doctor') {
        userData = await db.select().from(doctor)
            .where(eq(doctor.userId, data.id))
            .limit(1)
    }
    if (role == 'receptionist') {
        userData = await db.select().from(receptionist)
            .where(eq(receptionist.userId, data.id))
            .limit(1)
    }

    if (!userData) throw new Error('Unauthorized');

    return userData[0].id;
}

export default async function CreateAppointmentPage() {
    const { data } = await getSession({
        fetchOptions: {
            headers: await headers()
        }
    })

    if (!data || (data.user.role != 'doctor' && data.user.role != 'receptionist')) return redirect('/dashboard')

    if (!data.user) return;

    const userId = await getUserId(data.user, data.user.role)

    return (
        <div className='w-full'>
            <CreateAppointment userId={userId} role={data?.user.role} />
        </div>
    )
}