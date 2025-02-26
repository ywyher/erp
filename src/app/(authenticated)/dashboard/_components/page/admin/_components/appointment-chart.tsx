'use client'

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function AppointmentChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['chart', 'appointment'],
    queryFn: async () => {
      return await getQuantityByDay({ 
        tableNames: ['appointment'],
      })
    }
  });

  useEffect(() =>{ 
    console.log(chartData)
  }, [chartData])

  const chartConfig = {
    appointments: {
      label: "Appointments",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if(!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Appointments"
        description="Showing total appointments over time"
        dateKey="date"
      />
    </>
  );
}