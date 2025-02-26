"use client"
 
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define the TimeRange type with additional options
type TimeRange = "90d" | "30d" | "7d" | "6m" | "1y" | "2y" | "all"

// Define the types for the props
interface ReusableChartProps {
  data: any[]
  config: ChartConfig
  dateKey?: string
  title?: string
  description?: string
  timeRangeEnabled?: boolean
  defaultTimeRange?: TimeRange
  referenceDate?: string
  className?: string
  stacked?: boolean
}

export default function AreaChartWrapper({
  data,
  config,
  dateKey = "date",
  title = "Area Chart",
  description = "Data visualization",
  timeRangeEnabled = true,
  defaultTimeRange = "7d",
  referenceDate = new Date().toISOString().split('T')[0],
  className,
  stacked = true,
}: ReusableChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)

  // Filter data based on time range
  const filteredData = timeRangeEnabled ? data.filter((item) => {
    // If "all" is selected, return all data
    if (timeRange === "all") {
      return true;
    }
    
    const date = new Date(item[dateKey])
    const reference = new Date(referenceDate)
    let daysToSubtract = 90
    
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "6m") {
      daysToSubtract = 180 // Approximately 6 months
    } else if (timeRange === "1y") {
      daysToSubtract = 365 // 1 year
    } else if (timeRange === "2y") {
      daysToSubtract = 730 // 2 years (approximately)
    }
    
    const startDate = new Date(reference)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  }) : data
  
  // Get keys from config to use for data keys
  const dataKeys = Object.keys(config)
  
  // Check if data spans multiple years
  const hasMultipleYears = () => {
    if (!filteredData || filteredData.length <= 1) return false;
    
    const years = new Set();
    for (const item of filteredData) {
      const year = new Date(item[dateKey]).getFullYear();
      years.add(year);
      if (years.size > 1) return true;
    }
    return false;
  };
  
  const multipleYearsPresent = hasMultipleYears();
  
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        {timeRangeEnabled && (
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="1y" className="rounded-lg">
                Last 1 year
              </SelectItem>
              <SelectItem value="2y" className="rounded-lg">
                Last 2 years
              </SelectItem>
              <SelectItem value="all" className="rounded-lg">
                All time
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={config} className={`min-h-[200px] w-full ${className}`}>
          <AreaChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={dateKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                // Format date to include year if data spans multiple years
                try {
                  const date = new Date(value);
                  return multipleYearsPresent 
                    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                } catch (e) {
                  return value.toString().slice(0, 3);
                }
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <defs>
              {/* Dynamically generate gradients based on config */}
              {dataKeys.map((key) => (
                <linearGradient key={`fill-${key}`} id={`fill${key.charAt(0).toUpperCase() + key.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            
            {/* Dynamically generate Area components based on config */}
            {dataKeys.map((key) => (
              <Area 
                key={key}
                dataKey={key}
                fill={`url(#fill${key.charAt(0).toUpperCase() + key.slice(1)})`}
                type="natural"
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
                stackId={stacked ? "a" : key}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}