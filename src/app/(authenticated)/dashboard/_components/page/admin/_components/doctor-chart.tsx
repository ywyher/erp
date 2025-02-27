"use client";

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";

export default function DoctorChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", "doctor"],
    queryFn: async () => {
      return await getQuantityByDay({
        tableNames: ["doctor"],
      });
    },
  });

  const chartConfig = {
    doctors: {
      label: "Doctors",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  if (!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Doctors"
        description="Showing total doctors over time"
        dateKey="date"
        stacked={false}
      />
    </>
  );
}
