"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import { days as daysList } from "@/app/(authenticated)/dashboard/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/datetime-picker";
import { format } from "date-fns";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { parseTimeStringToDate, transformArrToObj } from "@/lib/funcs";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const ScheduleItem = ({
  day,
  schedules,
  addSchedule,
  removeSchedule,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: {
  day: string;
  schedules: Schedules;
  addSchedule: (day: string) => void;
  removeSchedule: (day: string, index: number) => void;
  startTime: string | undefined;
  setStartTime: Dispatch<SetStateAction<string | undefined>>;
  endTime: string | undefined;
  setEndTime: Dispatch<SetStateAction<string | undefined>>;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Badge className="cursor-pointer" variant="outline">
        {day}
      </Badge>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <Button onClick={() => addSchedule(day)}>Add Schedule</Button>
          <div className="flex flex-row gap-2">
            <label>Start Time</label>
            <TimePicker
              date={startTime ? parseTimeStringToDate(startTime) : undefined}
              onChange={(date) =>
                setStartTime(date ? format(date, "HH:mm") : undefined)
              }
              granularity="minute"
              hourCycle={12}
            />
          </div>
          <div className="flex flex-row gap-2">
            <label>End Time</label>
            <TimePicker
              date={endTime ? parseTimeStringToDate(endTime) : undefined}
              onChange={(date) =>
                setEndTime(date ? format(date, "HH:mm") : undefined)
              }
              granularity="minute"
              hourCycle={12}
            />
          </div>
        </div>
        <div>
          {schedules[day]?.length > 0 ? (
            <div className="flex flex-col gap-2">
              <label className="text-xl font-bold capitalize">
                {day} Schedule
              </label>
              <ul>
                {schedules[day].map((range, i) => (
                  <li key={i} className="flex flex-row justify-between">
                    {range.startTime} - {range.endTime}
                    <Trash2
                      className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => removeSchedule(day, i)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No schedules added for {day}.</p>
          )}
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

export default function ScheduleSelector({
  schedules,
  setSchedules,
  selectedDays,
  setSelectedDays,
}: {
  schedules: Schedules;
  setSchedules: Dispatch<SetStateAction<Schedules>>;
  selectedDays: string[];
  setSelectedDays: Dispatch<SetStateAction<string[]>>;
}) {
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endTime, setEndTime] = useState<string | undefined>(undefined);

  const handleDaysChange = (selectedOptions: Option[]) => {
    const selectedValues = selectedOptions.map((option: Option) => option.value);

    setSelectedDays(selectedValues);
    setSchedules((prevSchedules) => {
      return Object.fromEntries(
        Object.entries(prevSchedules).filter(([day]) =>
          selectedValues.includes(day),
        ),
      );
    });
  };

  const addSchedule = (day: string) => {
    if (!startTime || !endTime)
      return toast.error("Please select both start and end times.");
    if (startTime >= endTime)
      return toast.error(
        "Invalid Time Range. The start time must be earlier than the end time.",
      );

    const newSchedule = { startTime, endTime };
    const currentSchedules = schedules[day] || [];

    // Check for overlapping schedules
    const conflict = currentSchedules.find(({ startTime: s, endTime: e }) => {
      return (
        (startTime >= s && startTime < e) || // New start falls within an existing range
        (endTime > s && endTime <= e) || // New end falls within an existing range
        (startTime <= s && endTime >= e) // New range fully overlaps an existing one
      );
    });

    if (conflict) {
      toast.error(
        `Conflicting schedule: ${conflict.startTime} - ${conflict.endTime}`,
      );
      return;
    }

    // Update state
    setSchedules((prevSchedules) => ({
      ...prevSchedules,
      [day]: [...(prevSchedules[day] || []), newSchedule],
    }));

    // Reset after a schedule is successfully added
    setStartTime(undefined);
    setEndTime(undefined);
  };

  const removeSchedule = (day: string, index: number) => {
    setSchedules((prevSchedules) => {
      const filteredSchedules = prevSchedules[day].filter(
        (_, i) => i !== index,
      );
      return filteredSchedules.length
        ? { ...prevSchedules, [day]: filteredSchedules }
        : Object.fromEntries(
            Object.entries(prevSchedules).filter(([key]) => key !== day),
          );
    });
  };

  const memoizedSelectedDays = useMemo(() => selectedDays, [selectedDays]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label>Work Days</label>
        <MultipleSelector
          onChange={handleDaysChange}
          options={daysList}
          value={transformArrToObj(selectedDays)}
          placeholder="Select work days..."
          emptyIndicator={
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              No results found.
            </p>
          }
        />
      </div>
      <div className="flex flex-row gap-3">
        {memoizedSelectedDays.map((day) => (
          <ScheduleItem
            key={day}
            day={day}
            schedules={schedules}
            addSchedule={addSchedule}
            removeSchedule={removeSchedule}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />
        ))}
      </div>
    </div>
  );
}
