import { Appointment, Doctor, User } from "@/lib/db/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, User as UserIcon, Stethoscope, Mail, Phone } from "lucide-react"

export default function ReservationAppointmentData({ data: { appointment, doctor } }: {
    data: {
        appointment: Appointment,
        doctor: Doctor & {
            user: User
        },
    }
}) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reservation Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                <span>Date: {appointment.startTime.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span>Time: {appointment.startTime.toLocaleTimeString()} - {appointment.endTime.toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                                <span>Status: {appointment.status}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Doctor Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                                <span>Name: {doctor.user.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <span>Email: {doctor.user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <span>Phone: {doctor.user.phoneNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                                <span>Specialty: {doctor.specialty}</span>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}