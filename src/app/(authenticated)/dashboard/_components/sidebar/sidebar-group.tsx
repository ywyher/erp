"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, MoreHorizontal } from "lucide-react";

import {
  SidebarGroup as CSidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { MenuItem } from "@/app/(authenticated)/dashboard/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SidebarGroup({
  items,
  label,
}: {
  items: MenuItem[];
  label: string;
}) {
  const pathname = usePathname(); // Get the current URL path

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <CSidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            {label}
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard" // Exact match for dashboard
                    : pathname.startsWith(`${item.url}/`) ||
                      pathname === item.url; // Ensure sub-paths match properly

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={`
                                        flex flex-row justify-between items-center
                                        ${isActive && "bg-gray-200 dark:bg-gray-700 rounded-lg transition"}
                                    `}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`
                                                flex items-center gap-2 p-2 rounded-md transition 
                                            `}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.actions && item.actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction>
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          {item.actions.map((action, index) => (
                            <DropdownMenuItem
                              className="cursor-pointer flex flex-row gap-1"
                              key={index}
                              onClick={action.onClick}
                            >
                              {action.icon && <action.icon className="mr-2" />}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </CSidebarGroup>
    </Collapsible>
  );
}
