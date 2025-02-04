'use client'

import { listDoctors } from "@/components/doctors/actions";
import { DoctorCard } from "@/components/doctors/doctor-card";
import DoctorsFilters from "@/components/doctors/filters";
import { Doctor, Schedule, User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query"
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { DateRange } from "react-day-picker"
import { parseAsJson } from 'nuqs'
import { z } from "zod"
import { useEffect } from "react";

export default function DoctorsList({ book, customSchedule = false }: { book: boolean, customSchedule?: boolean }) {
    const [specialties, setSpecialties] = useQueryState('specialties', parseAsArrayOf(parseAsString))
    const [name, setName] = useQueryState('name')
    const [date, setDate] = useQueryState(
        'date',
        parseAsJson<DateRange | undefined>(z.object({
            from: z.date(),
            to: z.date().optional(),
        }).parse)
    )

    const { data: doctors, isLoading, refetch } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            const doctors = await listDoctors({ specialties, date, name });
            return doctors as { user: User, doctor: Doctor, schedules: Schedule[] }[];
        }
    })

    const handleApplyFilters = () => {
        refetch();
    }

    const handleResetFilters = () => {
        setDate(null)
        setSpecialties(null)
        setName(null)
    }

    useEffect(() => {
        if (date == null && specialties == null && name == null) {
            refetch()
        }
    }, [specialties, date, name])

    if (isLoading) return <>Loading...</>

    return (
        <div className="flex flex-col gap-3">
            <DoctorsFilters onApply={handleApplyFilters} onReset={handleResetFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {
                    doctors && doctors.length != 0 && doctors.map((doctor) => {
                        return (
                            <DoctorCard key={doctor.user.id} data={doctor} book={book} customSchedule={customSchedule} />
                        )
                    })
                }
            </div >
            {doctors?.length == 0 && (
                <div className="flex flex-row justify-center w-full">
                    <span>No doctors found, try messing with the filters</span>
                </div>
            )}
        </div>
    )
}
