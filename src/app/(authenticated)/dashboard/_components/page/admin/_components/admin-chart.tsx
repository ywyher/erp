"use client";

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";

export default function AdminChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", "admin"],
    queryFn: async () => {
      return await getQuantityByDay({
        tableNames: ["user"],
        conditions: {
          user: [{ field: "role", operator: "eq", value: "admin" }],
        },
      });
    },
  });

  const chartConfig = {
    admins: {
      label: "Admins",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  if (!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Admins"
        description="Showing total admins over time"
        dateKey="date"
        stacked={false}
      />
    </>
  );
}
