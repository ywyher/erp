"use client";

import { listDoctors } from "@/components/doctors/actions";
import { DoctorCard } from "@/components/doctors/doctor-card";
import DoctorsFilters from "@/components/doctors/filters";
import { Doctor, Schedule, User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsString,
  useQueryState,
  parseAsJson,
} from "nuqs";
import { DateRange } from "react-day-picker";
import { z } from "zod";
import { useState } from "react";
import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorsList({
  book,
  customSchedule = false,
}: {
  book: boolean;
  customSchedule?: boolean;
}) {
  const [specialties, setSpecialties] = useQueryState(
    "specialties",
    parseAsArrayOf(parseAsString),
  );
  const [name, setName] = useQueryState("name");
  const [date, setDate] = useQueryState(
    "date",
    parseAsJson<DateRange | undefined>(
      z.object({
        from: z.date(),
        to: z.date().optional(),
      }).parse,
    ),
  );
  const [filters, setFilters] = useState<{
    specialties: string[] | null;
    date: DateRange | null;
    name: string | null;
  }>({
    specialties: null,
    date: null,
    name: null,
  });

  const {
    data: doctors,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["doctors", filters],
    queryFn: async () => {
      return (await listDoctors({ specialties, date, name })) as {
        user: User;
        doctor: Doctor;
        schedules: Schedule[];
      }[];
    },
  });

  const handleApplyFilters = () => {
    setFilters({ specialties, date, name });
    refetch();
  };

  const handleResetFilters = () => {
    setDate(null);
    setSpecialties(null);
    setName(null);
    setFilters({ date: null, name: null, specialties: null });
  };

  return (
    <CardLayout title="Book an appointment">
      <div className="flex flex-col gap-4">
        <DoctorsFilters
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
        <div className="flex flex-col gap-3">
          <div className="text-lg font-semibold">Listed Doctors</div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {!isLoading ? (
              doctors && doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.user.id}
                    data={doctor}
                    book={book}
                    customSchedule={customSchedule}
                  />
                ))
              ) : (
                <div className="flex justify-center items-center w-full col-span-full">
                  <span className="text-center text-gray-500">
                    No doctors found, try adjusting the filters.
                  </span>
                </div>
              )
            ) : (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-[300px]" />
              ))
            )}
          </div>
        </div>
      </div>
    </CardLayout>
  );
}
