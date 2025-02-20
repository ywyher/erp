'use client'

import SidebarGroup from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar-group";
import { MenuItem } from "@/app/(authenticated)/dashboard/types";
import { CalendarCheck, ConciergeBell, Home, Lock, LogOut, Settings, Stethoscope, User2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter()

    const mainGroupItems: MenuItem[] = [
        {
            title: "Home",
            url: "/dashboard",
            icon: Home,
            actions: [
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
        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings ,
        },
        {
            title: "Admin",
            url: "/dashboard/admins",
            icon: Lock,
        },
        {
            title: "Users",
            url: "/dashboard/users",
            icon: User2,
        },
        {
            title: "Doctors",
            url: "/dashboard/doctors",
            icon: Stethoscope,
        },
        {
            title: "Receptionists",
            url: "/dashboard/receptionists",
            icon: ConciergeBell,
        },
        {
            title: "Appointments",
            url: "/dashboard/appointments",
            icon: CalendarCheck,
        },
        {
            title: "Operations",
            url: "/dashboard/operations",
            icon: CalendarCheck,
        },
    ];

    return (
        <>
            <SidebarGroup items={mainGroupItems} label="Main" />
        </>
    )
}