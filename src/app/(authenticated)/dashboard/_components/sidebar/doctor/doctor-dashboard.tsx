'use client'

import SidebarGroup from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar-group";
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