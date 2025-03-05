"use client";

import { getEmployeeId, getSchedules } from "@/lib/db/queries";
import { Doctor, Schedule } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationChart from "@/app/(authenticated)/dashboard/_components/page/_components/operation-chart";
import AppointmentChart from "@/app/(authenticated)/dashboard/_components/page/_components/appointment-chart";
import { ScheduleDisplay } from "@/components/schedule-display";

export default function DoctortPage({ userId }: { userId: string }) {
  const { data: doctorId, isLoading: isDoctorIdLoading } = useQuery({
    queryKey: ["doctorId", userId],
    queryFn: async () => {
      return (await getEmployeeId(userId, "doctor")) as Doctor["id"];
    },
  });

  const { data: schedules, isLoading: isScheduleLoading } = useQuery({
    queryKey: ["work-schedule", userId],
    queryFn: async () => {
      return (await getSchedules(userId)) as Schedule[];
    },
  });

  if (!schedules || isScheduleLoading) return <>Loading</>;
  if (!doctorId || isDoctorIdLoading) return <>Loading</>;

  return (
    <Tabs defaultValue="analysis" className="flex flex-col gap-3">
      <TabsList>
        <TabsTrigger value="overall">Overall</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="overall" className="flex justify-end w-full">
        <div className="w-full lg:w-[400px]">
          <ScheduleDisplay schedules={schedules} dialog={false} />
        </div>
      </TabsContent>
      <TabsContent
        value="analysis"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 p-4"
      >
        <OperationChart userId={doctorId} role="doctor" />
        <AppointmentChart userId={doctorId} role="doctor" />
      </TabsContent>
    </Tabs>
  );
}
