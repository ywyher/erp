'use client'

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import MultipleSelector from "@/components/ui/multi-select";
import { days as daysList } from "@/app/(authenticated)/dashboard/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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


export default function ScheduleSelector({
    schedules,
    setSchedules,
    selectedDays,
    setSelectedDays
}: {
    schedules: Schedules;
    setSchedules: Dispatch<SetStateAction<Schedules>>;
    selectedDays: string[];
    setSelectedDays: Dispatch<SetStateAction<string[]>>;
}) {
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);

    const handleDaysChange = (selectedOptions: any) => {
        const selectedValues = selectedOptions.map((option: any) => option.value); // Extract values
        setSelectedDays(selectedValues);
        // Remove any days from the schedules state that were deselected
        const deselectedDays = selectedDays.filter((day) => !selectedValues.includes(day));

        if (deselectedDays.length > 0) {
            setSchedules((prevSchedules) => {
                const updatedSchedules = { ...prevSchedules };
                deselectedDays.forEach((day) => {
                    delete updatedSchedules[day]; // Remove the deselected day from schedules
                });
                return updatedSchedules;
            });
        }
    };

    const addSchedule = (day: string) => {
        if (!startTime || !endTime) {
            toast.error("Please select both start and end times.")
            return;
        }

        if (startTime >= endTime) {
            toast.error("Invalid Time Range The start time must be earlier than the end time.")
            return;
        }

        setSchedules((prevSchedules) => ({
            ...prevSchedules,
            [day]: [
                ...(prevSchedules[day] || []),
                { startTime, endTime },
            ],
        }));

        // Reset the time inputs after adding
        setStartTime(undefined);
        setEndTime(undefined);
    };

    const removeSchedule = (day: string, index: number) => {
        setSchedules((prevSchedules) => {
            const updatedSchedules = { ...prevSchedules };
            updatedSchedules[day] = updatedSchedules[day].filter((_, i) => i !== index);
            if (updatedSchedules[day].length === 0) delete updatedSchedules[day];
            return updatedSchedules;
        });
    };

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
                {selectedDays.map((day, index) => (
                    <Popover key={index}>
                        <PopoverTrigger asChild>
                            <Badge className="cursor-pointer" variant="outline">{day}</Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-4">
                                    <Button onClick={() => addSchedule(day)}>Add Schedule</Button>
                                    <div className="flex flex-row gap-2">
                                        <TimePicker
                                            date={parseTimeStringToDate(startTime)}
                                            onChange={(date) => setStartTime(date ? format(date, "HH:mm") : undefined)}
                                            granularity="minute"
                                            hourCycle={12}
                                            label="Start Time"
                                        />
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <TimePicker
                                            date={parseTimeStringToDate(endTime)}
                                            onChange={(date) => setEndTime(date ? format(date, "HH:mm") : undefined)}
                                            granularity="minute"
                                            hourCycle={12}
                                            label="End Time"
                                        />
                                    </div>
                                </div>
                                <div>
                                    {schedules[day]?.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xl font-bold capitalize">{day} Schedule</label>
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
                ))}
            </div>
        </div>
    );
}