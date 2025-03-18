'use client'

import Header from "@/components/header";
import { DataTable } from "@/components/ui/data-table";
import { getSession } from "@/lib/auth-client"
import { User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query"
import { appointmentTableColumns } from "../dashboard/appointments/columns";
import DashboardLayout from "../dashboard/_components/dashboard-layout";
import { getAppointments } from "@/app/(authenticated)/dashboard/appointments/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardLayout from "@/components/card-layout";

export default function Appointments() {
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['my-appointments'],
        queryFn: async () => {
            const { data } = await getSession();
            return (data?.user as User) || null;
        }
    })

    const { data: appointments, isLoading: isAppointmentLoading } = useQuery({
        queryKey: ['list-appointments', user?.role],
        queryFn: async () => {
            return await getAppointments(
                user?.id as User["id"],
                user?.role as User["role"],
            );
        },
        enabled: user?.id ? true : false
    });

    if (isUserLoading || isAppointmentLoading) return <>Loading...</>;

    return (
        <>
            <Header />
            <CardLayout title="My Appointments">
                {appointments && (
                    <DataTable
                        columns={appointmentTableColumns}
                        data={appointments}
                        filters={["doctorId", "patientId"]}
                        bulkTableName="appointment"
                        hiddenColumns={["id", "createdBy", "role", "patientId", "endTime" ]}
                    />
                )}
            </CardLayout>
        </>
    )
}