"use client";

import AreaChartWrapper from "@/components/area-chart-wrapper";
import { ChartConfig } from "@/components/ui/chart";
import { getQuantityByDay } from "@/lib/db/queries";
import { User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";

export default function OperationChart({
  userId,
  role,
}: {
  userId?: User["id"];
  role?: User["role"];
}) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", "operation", userId],
    queryFn: async () => {
      return await getQuantityByDay({
        tableNames: ["operation"], // Now passing an array of tables
        conditions:
          userId && role
            ? {
                operation: [
                  { field: `${role}Id`, operator: "eq", value: userId },
                ],
              }
            : undefined,
      });
    },
  });

  const chartConfig = {
    operations: {
      label: "Operations",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if (!chartData || isLoading) return <>Loading...</>;

  return (
    <>
      <AreaChartWrapper
        data={chartData}
        config={chartConfig}
        title="Operations"
        description={`Showing ${userId && "your"} total operations over time`}
        dateKey="date"
      />
    </>
  );
}
