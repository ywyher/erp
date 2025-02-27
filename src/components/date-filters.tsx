"use client";

import * as React from "react";
import { format, parseISO, endOfDay, isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";

// Helper function to convert Date to ISO string without timezone offset
function dateToISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  // return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  return `${year}-${month}-${day}`;
}

export default function DateFilters({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const schema = z.object({
    from: z.string(),
    to: z.string().optional(),
  });

  const [dateRange, setDateRange] = useQueryState(
    "date",
    parseAsJson<{ from: string; to?: string } | undefined>(schema.parse),
  );

  const handleSelect = (newDate: DateRange | undefined) => {
    if (newDate?.from) {
      const from = dateToISOString(newDate.from);
      let to: string | undefined;

      if (newDate.to) {
        if (isSameDay(newDate.from, newDate.to)) {
          // If the same day is selected, set 'to' to the end of the day
          to = dateToISOString(endOfDay(newDate.to));
        } else {
          to = dateToISOString(newDate.to);
        }
      }

      setDateRange({ from, to });
    } else {
      setDateRange(null);
    }
  };

  const selected: DateRange | undefined = dateRange
    ? {
        from: parseISO(dateRange.from),
        to: dateRange.to ? parseISO(dateRange.to) : undefined,
      }
    : undefined;

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild className="w-full">
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(parseISO(dateRange.from), "LLL dd, y")} -{" "}
                  {format(parseISO(dateRange.to), "LLL dd, y")}
                </>
              ) : (
                format(parseISO(dateRange.from), "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            fromDate={new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
