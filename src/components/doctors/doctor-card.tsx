import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Doctor, Schedule, User } from '@/lib/db/schema'
import Pfp from '@/components/pfp'
import { ScheduleDisplay } from '@/components/schedule-display'
import { useDoctorIdStore, useDateStore } from '@/components/doctors/store'
import { useState } from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import CustomDate from '@/components/custom-date'
import { Button } from '@/components/ui/button'

type DoctorCard = {
    data: {
        user: User,
        doctor: Doctor,
        schedules: Schedule[]
    };
    book?: boolean;
    customSchedule?: boolean
}

export function DoctorCard({ 
        data,
        book = false,
        customSchedule = false
    }:  DoctorCard) {
    const [open, setOpen] = useState<boolean>(false)
    const { setDoctorId } = useDoctorIdStore()
    const { setDate } = useDateStore()

    const handleBookDoctor = (date: Date) => {
        setDoctorId(data.doctor.id)
        setDate(date)
        setOpen(false)
    }

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="flex flex-col items-center text-center">
                <Pfp image={data.user.image} className="w-20 h-20 sm:w-24 sm:h-24" />
                <CardTitle className="text-xl mb-1">{data.user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">@{data.user.username}</p>
                <Badge variant="secondary" className="mb-2">{data.doctor.specialty}</Badge>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-2">
                    <p className="text-sm"><strong>Email:</strong> {data.user.email}</p>
                    <p className="text-sm"><strong>Role:</strong> {data.user.role}</p>
                    <p className="text-sm"><strong>National ID:</strong> {data.user.nationalId}</p>
                    {book ? (
                        customSchedule ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        Select Schedules
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Schedules</DialogTitle>
                                </DialogHeader>
                                    <Tabs defaultValue="custom">
                                    <TabsList>
                                        <TabsTrigger value="offical">Offical</TabsTrigger>
                                        <TabsTrigger value="custom">Custom</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="offical">
                                        <ScheduleDisplay
                                            open={open}
                                            setOpen={setOpen}
                                            schedules={data.schedules}
                                            onClick={(e) => handleBookDoctor(e)}
                                            dialog={false}
                                        />
                                    </TabsContent>
                                    <TabsContent value="custom">
                                        <CustomDate
                                            onClick={(e) => handleBookDoctor(e)}
                                        />
                                    </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>
                        ): (
                            <ScheduleDisplay
                                open={open}
                                setOpen={setOpen}
                                schedules={data.schedules}
                                onClick={(e) => handleBookDoctor(e)}
                            />
                        )
                    ) : (
                        <ScheduleDisplay
                            open={open}
                            setOpen={setOpen}
                            schedules={data.schedules}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
