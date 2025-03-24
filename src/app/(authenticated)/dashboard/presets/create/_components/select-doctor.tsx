"use client"

import { getDoctors } from "@/app/(authenticated)/dashboard/presets/actions"
import InputSkeleton from "@/components/input-skeleton"
import { Combobox } from "@/components/ui/combobox"
import { Doctor } from "@/lib/db/schema"
import { useQuery } from "@tanstack/react-query"
import { Dispatch, SetStateAction, useEffect } from "react"

export default function SelectDoctor({ setSelectedDoctor }: {
    setSelectedDoctor: Dispatch<SetStateAction<Doctor['id']>>
}) {
    const { data: doctors, error, isLoading } = useQuery({
        queryKey: ["preset-fetching-doctors"],
        queryFn: async () => {
            return await getDoctors()
        }
    })

    if(!doctors || isLoading) return <InputSkeleton />

    return (
        <div className="flex flex-col gap-3">
            <div className="text-xl text-center">
                Select a doctor to create this preset for 
            </div>
            <Combobox 
                options={doctors}
                onChange={(e) => {
                    setSelectedDoctor(e)
                }}
            />
        </div>
    )
}