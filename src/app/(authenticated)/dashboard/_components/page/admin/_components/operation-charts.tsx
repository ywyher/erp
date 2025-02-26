'use client'

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";

export default function OperationChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['chart', 'operation'],
    queryFn: async () => {
      return await getQuantityByDay({ 
        tableNames: ['operation'],  // Now passing an array of tables
      })
    }
  });

  const chartConfig = {
    operations: {
      label: "Operations",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if(!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Operations"
        description="Showing total operations over time"
        dateKey="date"
      />
    </>
  );
}