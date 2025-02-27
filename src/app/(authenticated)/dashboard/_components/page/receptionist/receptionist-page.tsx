'use client'

import { ScheduleDisplay } from "@/components/schedule-display";
import { getSchedules } from "@/lib/db/queries";
import { Schedule } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import Employees from "@/components/employees";

export default function ReceptionistPage({ userId }: { userId: string }) {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['work-schedule', userId],
    queryFn: async () => {
      return await getSchedules(userId) as Schedule[]
    }
  })

  if (!schedules || isLoading) return <>Loading</>;

  return (
    <div className="p-4 flex flex-col xl:flex-row gap-4">
      <div className="flex-1">
        <Employees />
      </div>
      <div className="w-full xl:w-[400px] flex-shrink-0">
        <ScheduleDisplay schedules={schedules} dialog={false} />
      </div>
    </div>
  );
}