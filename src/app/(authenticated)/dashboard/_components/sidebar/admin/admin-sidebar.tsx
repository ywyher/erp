"use client";

import SidebarGroup from "@/app/(authenticated)/dashboard/_components/sidebar/sidebar-group";
import { MenuItem } from "@/app/(authenticated)/dashboard/types";
import { SidebarSeparator } from "@/components/ui/sidebar";
import {
  Bell,
  CalendarCheck,
  ConciergeBell,
  Cross,
  Home,
  Layers,
  Lock,
  MessageCircleQuestion,
  Newspaper,
  Plus,
  Settings,
  Slice,
  SquarePlus,
  Stethoscope,
  User2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();

  const mainGroupItems: MenuItem[] = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const manageGroupItems: MenuItem[] = [
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
  ];

  const socialGroupItems: MenuItem[] = [
    {
      title: "Services",
      url: "/dashboard/services",
      icon: Bell,
    },
    {
      title: "posts",
      url: "/dashboard/posts",
      icon: Newspaper,
      actions: [
        {
          label: "Create",
          onClick: () => {
            router.push("/dashboard/posts/create");
          },
          icon: Plus,
        },
      ],
    },
    {
      title: "Faq",
      url: "/dashboard/faqs",
      icon: MessageCircleQuestion,
    },
  ];

  const extrasGroupItems: MenuItem[] = [
    {
      title: "Doctors Presets",
      url: "/dashboard/presets",
      icon: Layers
    }
  ]

  return (
    <div className="flex flex-col gap-1">
      <SidebarGroup items={mainGroupItems} label="Main" />
      <SidebarSeparator />
      <SidebarGroup items={manageGroupItems} label="Manage" />
      <SidebarSeparator />
      <SidebarGroup items={socialGroupItems} label="Social" />
      <SidebarSeparator />
      <SidebarGroup items={extrasGroupItems} label="Extras" />
    </div>
  );
}
