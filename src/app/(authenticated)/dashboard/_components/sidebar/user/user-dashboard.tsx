'use client'

import UserDashboardMainGroup from "@/app/(authenticated)/dashboard/_components/sidebar/user/groups/main";
import { MenuItem } from "@/app/(authenticated)/dashboard/types";
import { CalendarCheck, Home, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
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
            title: "Appointments",
            url: "/dashboard/appointments",
            icon: CalendarCheck,
            actions: {
                hasActions: false,
            },
        },
    ];

    return (
        <>
            <UserDashboardMainGroup items={mainGroupItems} />
        </>
    )
}