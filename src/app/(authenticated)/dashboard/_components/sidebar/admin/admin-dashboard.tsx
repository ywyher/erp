'use client'

import AdminSidebarMainGroup from "@/app/(authenticated)/dashboard/_components/sidebar/admin/groups/main";
import { MenuItem } from "@/app/(authenticated)/dashboard/types";
import { ConciergeBell, Home, Lock, LogOut, Settings, Stethoscope, User2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
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
            title: "Admin",
            url: "/dashboard/admins",
            icon: Lock,
            actions: {
                hasActions: false,
            }
        },
        {
            title: "Users",
            url: "/dashboard/users",
            icon: User2,
            actions: {
                hasActions: false,
            }
        },
        {
            title: "Doctors",
            url: "/dashboard/doctors",
            icon: Stethoscope,
            actions: {
                hasActions: false,
            }
        },
        {
            title: "Receptionists",
            url: "/dashboard/receptionists",
            icon: ConciergeBell,
            actions: {
                hasActions: false,
            }
        },
    ];

    return (
        <>
            <AdminSidebarMainGroup items={mainGroupItems} />
        </>
    )
}