'use client'

import DoctorDashboardMainGroup from "@/app/(authenticated)/dashboard/_components/sidebar/doctor/groups/main";
import { MenuItem } from "@/app/(authenticated)/dashboard/types";
import { CalendarCheck, Home, Lock, LogOut, Settings, Stethoscope, User2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
    const router = useRouter()

    const mainGroupItems: MenuItem[] = [
        {
            title: "Home",
            url: "/dashboard",
            icon: Home,
            actions: {
                hasActions: true,
                items: [
                    {
                        label: "Settings",
                        onClick: () => {
                            router.push("/settings");
                        },
                        icon: Settings,
                    },
                    {
                        label: "Logout",
                        onClick: () => {
                            router.push("/logout");
                        },
                        icon: LogOut,
                    },
                ],
            },
        },
        {
            title: "Appointment",
            url: "/dashboard/appointments",
            icon: CalendarCheck,
            actions: {
                hasActions: false,
            }
        },
    ];

    return (
        <>
            <DoctorDashboardMainGroup items={mainGroupItems} />
        </>
    )
}