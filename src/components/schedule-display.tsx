import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { getDateByDayName, groupSchedulesByDay, parseTimeStringToDate } from "@/lib/funcs"
import { Schedule } from "@/lib/db/schema"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from 'lucide-react'
import { Dispatch, SetStateAction } from "react"

export function ScheduleDisplay({
    schedules,
    onClick,
    open,
    setOpen,
    dialog = true,
}: {
    schedules: Schedule[],
    onClick?: (date: Date) => void
    open?: boolean
    setOpen?: Dispatch<SetStateAction<boolean>>
    dialog?: boolean
}) {
    const getDayColor = (day: string) => {
        const colors: { [key: string]: string } = {
            monday: "bg-blue-900 text-blue-100",
            tuesday: "bg-green-900 text-green-100",
            wednesday: "bg-yellow-900 text-yellow-100",
            thursday: "bg-purple-900 text-purple-100",
            friday: "bg-pink-900 text-pink-100",
            saturday: "bg-red-900 text-red-100",
            sunday: "bg-indigo-900 text-indigo-100",
        }
        return colors[day.toLowerCase()] || "bg-gray-800 text-gray-100"
    }

    const groupedSchedules = groupSchedulesByDay(schedules)

    const sortedDays = Object.keys(groupedSchedules).sort((a, b) => {
        const days = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
        ]
        return days.indexOf(a) - days.indexOf(b)
    })

    const content = (
        <ScrollArea className="h-[400px] w-full rounded-md border border-gray-700">
            <div className="p-4 space-y-4">
                {sortedDays.map((day) => (
                    <Card
                        key={day}
                        className="overflow-hidden bg-gray-900 border-gray-700"
                    >
                        <CardContent className="p-0">
                            <div className={`p-3 ${getDayColor(day)}`}>
                                <h3 className="font-semibold text-lg">
                                    {format(getDateByDayName(day), 'EEEE, d MMMM')}
                                </h3>
                            </div>
                            <div className="p-3 space-y-3">
                                {groupedSchedules[day].map((schedule, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-row justify-between"
                                    >
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
                                                onClick={() => onClick(parseTimeStringToDate(schedule.startTime))}
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
        </ScrollArea>
    )

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
        content
    )
}