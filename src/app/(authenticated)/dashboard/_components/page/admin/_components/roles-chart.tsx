'use client'

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { useQuery } from "@tanstack/react-query";

export default function RolesChart() {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['chart', 'roles'],
    queryFn: async () => {
      return await getQuantityByDay({ 
        tableNames: ['user', 'doctor', 'receptionist'],  // Now passing an array of tables
      })
    }
  });

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
    doctors: {
      label: "Doctors",
      color: "hsl(var(--chart-2))",
    },
    receptionists: {
      label: "Receptionists",
      color: "hsl(var(--chart-3))",
    }
  } satisfies ChartConfig;

  if(!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Users & Doctors & Receptionists"
        description="Showing total users/doctors/receptionists over time"
        dateKey="date"
        stacked={false}
      />
    </>
  );
}