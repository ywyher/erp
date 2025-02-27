'use client'

import { ScheduleDisplay } from "@/components/schedule-display";
import { getSchedules } from "@/lib/db/queries";
import { Schedule } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OperationChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/operation-charts";
import AppointmentChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/appointment-chart";

export default function DoctortPage({ userId }: { userId: string }) {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['work-schedule', userId],
    queryFn: async () => {
      return await getSchedules(userId) as Schedule[]
    }
  })

  if (!schedules || isLoading) return <>Loading</>;

  return (
    <Tabs defaultValue="overall" className="flex flex-col gap-3">
        <TabsList>
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overall" className="w-full xl:w-[400px]">
          <ScheduleDisplay schedules={schedules} dialog={false} />
        </TabsContent>
        <TabsContent value="analysis" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
          <OperationChart />
          <AppointmentChart />
        </TabsContent>
    </Tabs>
  );
}
