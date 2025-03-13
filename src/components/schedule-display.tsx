import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getDateByDayName,
  groupSchedulesByDay,
  parseTimeStringToDate,
} from "@/lib/funcs";
import { Schedule } from "@/lib/db/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import CardLayout from "@/components/card-layout";

export function ScheduleDisplay({
  schedules,
  onClick,
  open,
  setOpen,
  dialog = true,
  maxItemsPerPage = 3,
}: {
  schedules: Schedule[];
  onClick?: (date: Date) => void;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  dialog?: boolean;
  maxItemsPerPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      monday: "bg-blue-900 text-blue-100",
      tuesday: "bg-green-900 text-green-100",
      wednesday: "bg-yellow-900 text-yellow-100",
      thursday: "bg-purple-900 text-purple-100",
      friday: "bg-pink-900 text-pink-100",
      saturday: "bg-red-900 text-red-100",
      sunday: "bg-indigo-900 text-indigo-100",
    };
    return colors[day.toLowerCase()] || "bg-gray-800 text-gray-100";
  };

  const groupedSchedules = groupSchedulesByDay(schedules);

  const sortedDays = Object.keys(groupedSchedules).sort((a, b) => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days.indexOf(a) - days.indexOf(b);
  });

  // Calculate pagination
  const totalDays = sortedDays.length;
  const totalPages = Math.ceil(totalDays / maxItemsPerPage);

  // Get current page items
  const startIndex = (currentPage - 1) * maxItemsPerPage;
  const endIndex = Math.min(startIndex + maxItemsPerPage, totalDays);
  const currentDays = sortedDays.slice(startIndex, endIndex);

  // Pagination controls
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const content = (
    <div className="w-full space-y-4">
      <div className="space-y-4">
        {currentDays.map((day) => (
          <Card
            key={day}
            className="overflow-hidden bg-gray-900 border-gray-700"
          >
            <CardContent className="p-0">
              <div className={`p-3 ${getDayColor(day)}`}>
                <h3 className="font-semibold text-lg">
                  {format(getDateByDayName(day), "EEEE, d MMMM")}
                </h3>
              </div>
              <div className="p-3 space-y-3">
                {groupedSchedules[day].map((schedule, index) => (
                  <div key={index} className="flex flex-row justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="w-20 justify-center"
                      >
                        {schedule.startTime}
                      </Badge>
                      <span className="text-sm text-gray-400">to</span>
                      <Badge
                        variant="secondary"
                        className="w-20 justify-center"
                      >
                        {schedule.endTime}
                      </Badge>
                    </div>
                    {onClick && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          onClick(parseTimeStringToDate(schedule.startTime))
                        }
                        className="ml-auto"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return dialog ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4" />
          View Schedules
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Weekly Schedules</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  ) : (
    <CardLayout title="Weekly Schedules" className="gap-4">
      {content}
    </CardLayout>
  );
}
