import UserData from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/_components/user-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import db from "@/lib/db"
import { User } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const getUserData = async (appointmentId: string) => {
    const appointment = await db.query.appointment.findFirst({
        columns: {
            patientId: true
        },
        where: (appointment, { eq }) => eq(appointment.id, appointmentId)
    })

    if (!appointment) return;

    const user = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, appointment.patientId)
    })

    if (!user) return;

    return user;
}

export default async function Appointment({ params: { appointmentId } }: { params: { appointmentId: string } }) {
    const user = await getUserData(appointmentId) as User;

    return (
        <Tabs defaultValue="user" className="w-full">
            <TabsList>
                <TabsTrigger className="w-full" value="user">User Data</TabsTrigger>
                <TabsTrigger className="w-full" value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
                <UserData user={user} />
            </TabsContent>
            <TabsContent value="password">
                
            </TabsContent>
        </Tabs>
    )
}