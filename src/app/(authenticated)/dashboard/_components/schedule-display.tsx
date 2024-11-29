import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

interface Schedule {
    day: string
    startTime: string
    endTime: string
}

interface ScheduleDisplayProps {
    schedules: Schedule[]
}

export function ScheduleDisplay({ schedules }: ScheduleDisplayProps) {
    const formatTime = (timeString: string) => {
        const date = new Date(timeString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getDayColor = (day: string) => {
        const colors: { [key: string]: string } = {
            monday: "bg-blue-100 text-blue-800",
            tuesday: "bg-green-100 text-green-800",
            wednesday: "bg-yellow-100 text-yellow-800",
            thursday: "bg-purple-100 text-purple-800",
            friday: "bg-pink-100 text-pink-800",
            saturday: "bg-red-100 text-red-800",
            sunday: "bg-indigo-100 text-indigo-800",
        }
        return colors[day.toLowerCase()] || "bg-gray-100 text-gray-800"
    }

    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const day = schedule.day.toLowerCase()
        if (!acc[day]) {
            acc[day] = []
        }
        acc[day].push(schedule)
        return acc
    }, {} as { [key: string]: Schedule[] })

    const sortedDays = Object.keys(groupedSchedules).sort((a, b) => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        return days.indexOf(a) - days.indexOf(b)
    })

    return (
        <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4 space-y-4">
                {sortedDays.map((day) => (
                    <Card key={day} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className={`p-3 ${getDayColor(day)}`}>
                                <h3 className="font-semibold">
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                </h3>
                            </div>
                            <div className="p-3 space-y-2">
                                {groupedSchedules[day].map((schedule, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <Badge variant="outline" className="w-20 justify-center">
                                            {formatTime(schedule.startTime)}
                                        </Badge>
                                        <span className="text-sm">to</span>
                                        <Badge variant="outline" className="w-20 justify-center">
                                            {formatTime(schedule.endTime)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    )
}