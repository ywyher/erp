"use client"

import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout"
import { getUser } from "@/app/(authenticated)/dashboard/presets/actions"
import PresetData from "@/app/(authenticated)/dashboard/presets/_components/preset-data"
import SelectDoctor from "@/app/(authenticated)/dashboard/presets/create/_components/select-doctor"
import InputSkeleton from "@/components/input-skeleton"
import { getOperationDocument } from "@/lib/db/queries"
import { Doctor, User } from "@/lib/db/schema"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function CreatePreset() {
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor['id']>("")

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['session', 'preset'],
        queryFn: async () => await getUser() as {
            id: User['id'],
            doctorId: Doctor['id'] | null,
            role: User['role']
        }
    })

    const { data: operationDocument, isLoading: isOperationDocumentLoading, error: operationDocumentError } = useQuery({
        queryKey: ['operationDocument'],
        queryFn: async () => await getOperationDocument({})
    })

    useEffect(() => {
        if(user && user.role == 'doctor') {
            setSelectedDoctor(user.doctorId as Doctor['id'])
        }
    }, [user])

    if(!user || isUserLoading) return (
        <DashboardLayout title="Create Preset" className="flex-1">
            <InputSkeleton />
        </DashboardLayout>
    )

    return (
        <DashboardLayout title="Create Preset" className="flex-1">
            {(isOperationDocumentLoading && !selectedDoctor && user.role != 'doctor') && (
                <InputSkeleton />
            )}
            {(operationDocumentError || operationDocument?.error) && (
                <p className="text-center text-red-500">{(operationDocument?.error)}</p>
            )}
            {(operationDocument?.name && !selectedDoctor && user.role != 'doctor') && (
                <SelectDoctor setSelectedDoctor={setSelectedDoctor} />
            )}
            {(operationDocument?.name && selectedDoctor) && (
                <PresetData
                 doctorId={selectedDoctor}
                 operationDocument={operationDocument?.name}
                 operation="create"
                />
            )}
        </DashboardLayout>
    )
}