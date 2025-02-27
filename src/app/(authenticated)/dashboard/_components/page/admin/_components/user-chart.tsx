"use client";

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";

export default function UserChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", "user"],
    queryFn: async () => {
      return await getQuantityByDay({
        tableNames: ["user"],
      });
    },
  });

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if (!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Users"
        description="Showing total users over time"
        dateKey="date"
        stacked={false}
      />
    </>
  );
}
