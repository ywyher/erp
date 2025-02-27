"use client";

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";

export default function ReceptionistChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", "receptionist"],
    queryFn: async () => {
      return await getQuantityByDay({
        tableNames: ["receptionist"],
      });
    },
  });

  const chartConfig = {
    receptionists: {
      label: "Receptionists",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  if (!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Receptionists"
        description="Showing total receptionists over time"
        dateKey="date"
        stacked={false}
      />
    </>
  );
}
