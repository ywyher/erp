import { useEffect } from "react";
import { getEmployees } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";
import { DoctorCard } from "@/components/doctors/doctor-card";
import { ReceptionistCard } from "@/components/receptionist-card";
import { Button } from "@/components/ui/button";
import { parseAsJson, parseAsStringEnum, useQueryState } from "nuqs";
import { z } from "zod";
import { Doctor, Receptionist, Schedule, User } from "@/lib/db/schema";
import { Skeleton } from "@/components/ui/skeleton";
import DateFilters from "@/components/date-filters";
import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout";
import { format, isToday } from "date-fns";

export default function Employees() {
  const [role, setRole] = useQueryState('role', 
    parseAsStringEnum(['doctor', 'receptionist']).withDefault('doctor')
  );

  const [date, setDate] = useQueryState(
      'date',
      parseAsJson<{ from: string; to?: string } | undefined>(z.object({
          from: z.string(),
          to: z.string().optional(),
      }).optional().parse).withDefault({ from: new Date().toISOString().split("T")[0] })
  );

  // Type for our query response based on the selected role
  type EmployeeData = 
    | { user: User; doctor: Doctor; schedules: Schedule[] }
    | { user: User; receptionist: Receptionist; schedules: Schedule[] };

  const { data, isLoading } = useQuery({
    queryKey: ["employees", role, date],
    queryFn: async () => {
      return await getEmployees({ date: date || undefined, role: role || 'doctor' }) as EmployeeData[];
    },
  });

  const formattedTitle = (() => {
    if (date?.from) {
      const fromDate = new Date(date.from);
      if (!date.to && isToday(fromDate)) {
        return `${role.charAt(0).toUpperCase() + role.slice(1)}s working today`;
      } else if (date.to) {
        const toDate = new Date(date.to);
        return `${role.charAt(0).toUpperCase() + role.slice(1)}s working from ${format(fromDate, "MMMM d")} to ${format(toDate, "MMMM d")}`;
      }
    }
    return `${role.charAt(0).toUpperCase() + role.slice(1)}s`;
  })();

  return (
    <CardLayout title={formattedTitle} className="gap-0">
      <div className="flex flex-col gap-5 p-4">
        <div className="flex gap-2 w-full flex-col lg:flex-row">
          <div className="flex flex-row gap-2 w-full">
            <Button
              className="w-full"
              variant={role === "doctor" ? "default" : "outline"}
              onClick={() => setRole("doctor")}
            >
              Doctors
            </Button>
            <Button
              className="w-full"
              variant={role === "receptionist" ? "default" : "outline"}
              onClick={() => setRole("receptionist")}
            >
              Receptionists
            </Button>
          </div>
          <DateFilters />
          <Button
            variant="destructive"
            onClick={() => {
              setRole(null);
              setDate(null);
            }}
          >
            Reset Filters
          </Button>
        </div>
        <div className="flex flex-col gap-3 w-full">
            <div className="text-lg font-semibold">
              {role === "doctor" ? "Listed Doctors" : "Listed Receptionists"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {!isLoading ? (
                    data && data.length > 0 ? (
                        data.map((employee) => (
                            role === "doctor" ? (
                              <DoctorCard
                                  key={(employee as any).user.id}
                                  data={employee as { user: User; doctor: Doctor; schedules: Schedule[] }}
                              />
                            ) : (
                              <ReceptionistCard
                                  key={(employee as any).user.id}
                                  data={employee as { user: User; receptionist: Receptionist; schedules: Schedule[] }}
                              />
                            )
                        ))
                    ) : (
                        <div className="flex justify-center items-center w-full col-span-full">
                            <span className="text-center text-gray-500">
                              No {role === "doctor" ? "doctors" : "receptionists"} found, try adjusting the filters.
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