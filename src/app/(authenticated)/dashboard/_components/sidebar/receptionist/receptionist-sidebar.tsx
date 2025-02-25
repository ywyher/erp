'use client'

import SidebarGroup from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar-group";
import { MenuItem } from "@/app/(authenticated)/dashboard/types";
import { SidebarSeparator } from "@/components/ui/sidebar";
import { CalendarCheck, Cross, Home, SquarePlus, Slice } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReceptionistSidebar() {
    const router = useRouter()

    const mainGroupItems: MenuItem[] = [
        {
            title: "Home",
            url: "/dashboard",
            icon: Home,
        },
    ];

    const manageGroupItems: MenuItem[] = [
        {
            title: "Appointments",
            url: "/dashboard/appointments",
            icon: CalendarCheck,
            actions: [
                {
                    label: "Create",
                    onClick: () => {
                        router.push("/dashboard/appointments/create");
                    },
                    icon: SquarePlus,
                },
            ],
        },
        {
            title: "Operations",
            url: "/dashboard/operations",
            icon: Cross,
            actions: [
                {
                    label: "Create",
                    onClick: () => {
                        router.push("/dashboard/operations/create");
                    },
                    icon: Slice,
                },
            ],
        },
    ]

    return (
        <div className="flex flex-col gap-1">
            <SidebarGroup items={mainGroupItems} label="Main" />
            <SidebarSeparator />
            <SidebarGroup items={manageGroupItems} label="Manage" />
        </div>
    )
}