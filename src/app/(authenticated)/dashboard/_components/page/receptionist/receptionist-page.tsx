"use client";

import { ScheduleDisplay } from "@/components/schedule-display";
import { getEmployeeId, getSchedules } from "@/lib/db/queries";
import { Receptionist, Schedule } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import Employees from "@/components/employees";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationChart from "@/app/(authenticated)/dashboard/_components/page/_components/operation-chart";
import AppointmentChart from "@/app/(authenticated)/dashboard/_components/page/_components/appointment-chart";

export default function ReceptionistPage({ userId }: { userId: string }) {
  const { data: receptionistId, isLoading: isReceptionistIdLoading } = useQuery(
    {
      queryKey: ["receptionistId", userId],
      queryFn: async () => {
        return (await getEmployeeId(
          userId,
          "receptionist",
        )) as Receptionist["id"];
      },
    },
  );

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["work-schedule", userId],
    queryFn: async () => {
      return (await getSchedules(userId)) as Schedule[];
    },
  });

  if (!schedules || isLoading) return <>Loading</>;
  if (!receptionistId || isReceptionistIdLoading) return <>Loading</>;

  return (
    <Tabs defaultValue="analysis" className="flex flex-col gap-3">
      <TabsList>
        <TabsTrigger value="overall">Overall</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
      </TabsList>
      <TabsContent
        value="overall"
        className="p-4 flex flex-col xl:flex-row gap-4"
      >
        <div className="flex-1">
          <Employees />
        </div>
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <ScheduleDisplay schedules={schedules} dialog={false} />
        </div>
      </TabsContent>
      <TabsContent
        value="analysis"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 p-4"
      >
        <OperationChart userId={receptionistId} role="receptionist" />
        <AppointmentChart userId={receptionistId} role="receptionist" />
      </TabsContent>
    </Tabs>
  );
}
