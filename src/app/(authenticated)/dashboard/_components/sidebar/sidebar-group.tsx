import { Calendar, ChevronDown, ChevronUp, Home, Inbox, MoreHorizontal, Search, Settings, User2 } from "lucide-react"

import {
    SidebarGroup as CSidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { MenuItem } from "@/app/(authenticated)/dashboard/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SidebarGroup({ items, label }: { items: MenuItem[], label: string }) {
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
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
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
                                                    <DropdownMenuItem className="cursor-pointer flex flex-row gap-1" key={index} onClick={action.onClick}>
                                                        {action.icon && <action.icon className="mr-2" />}
                                                        {action.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </CollapsibleContent>
            </CSidebarGroup>
        </Collapsible>
    )
}