"use client";

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";

export default function AppointmentChart({ userId, role }: { userId?: User['id'], role?: User['role'] }) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", "appointment", userId],
    queryFn: async () => {
      return await getQuantityByDay({
        tableNames: ["appointment"], // Now passing an array of tables
        conditions: (userId && role) ? {
          appointment: [
            { field: `${role}Id`, operator: 'eq', value: userId }
          ],
        } : undefined
      });
    },
  });

  const chartConfig = {
    appointments: {
      label: "Appointments",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if (!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Appointments"
        description={`Showing ${userId && "your"} total appointments over time`}
        dateKey="date"
      />
    </>
  );
}
