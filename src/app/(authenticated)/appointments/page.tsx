'use client'

import Header from "@/components/header";
import { DataTable } from "@/components/ui/data-table";
import { getSession } from "@/lib/auth-client"
import { User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query"
import { appointmentTableColumns } from "../dashboard/appointments/columns";
import CardLayout from "@/components/card-layout";
import { getAppointments } from "@/app/(authenticated)/appointments/actions";
import DataTableSkeleton from "@/components/data-table-skeleton";

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
            return await getAppointments(user?.id as User['id']);
        },
        enabled: user?.id ? true : false
    });

    return (
        <>
            <Header />
            <CardLayout title="My Appointments"
                className={`${(isUserLoading || isAppointmentLoading) && 'flex flex-col gap-3'}`}
            >
                {(isUserLoading || isAppointmentLoading) && (
                    <DataTableSkeleton />
                )}
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