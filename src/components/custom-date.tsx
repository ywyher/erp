"use client";

import { useState } from "react";
import { TimePicker } from "@/components/ui/datetime-picker";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import LoadingBtn from "@/components/loading-btn";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type CustomDate = {
  onClick: (date: Date) => void;
};

export default function CustomDate({ onClick }: CustomDate) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    setIsLoading(true);
    let errorMessage = "";

    // Check for null or empty values and build the error message
    if (!date) {
      errorMessage += "Date is required. ";
    }
    if (!time) {
      errorMessage += "Time is required. ";
    }

    // If there's an error message, show it in a toast
    if (errorMessage) {
      toast.error(errorMessage.trim()); // Show error in toast
      setIsLoading(false);
      return;
    }

    if (!date || !time) return;

    const adjustedTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
    );

    onClick(adjustedTime);
    setIsLoading(false);
  };

  const handleCurrentDate = () => {
    const now = new Date();
    setDate(now);
    setTime(now);
    onClick(now);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-3 items-start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border w-fit"
        />
        <TimePicker
          date={time}
          onChange={setTime}
          granularity="minute"
          hourCycle={12}
        />
      </div>
      <LoadingBtn isLoading={isLoading} onClick={handleSubmit}>
        Submit
      </LoadingBtn>

      <div className="flex items-center justify-center">
        <Separator className="flex-grow" />
        <span className="px-2 text-sm text-muted-foreground">OR</span>
        <Separator className="flex-grow" />
      </div>

      <LoadingBtn isLoading={isLoading} variant="secondary" onClick={handleCurrentDate}>
        Current Date
      </LoadingBtn>
    </div>
  );
}
