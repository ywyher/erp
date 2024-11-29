'use client';

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession, signOut } from "@/lib/auth-client";

import {
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronUp, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Pfp from "@/components/pfp";
import { useState } from "react";

export function DashboardSidebarFooter() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const { data: user, isLoading } = useQuery({
        queryKey: ['session', 'dashboardSidebarFooter'],
        queryFn: async () => {
            const { data } = await getSession();
            return data?.user || null
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <>
            {user && (
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu onOpenChange={setIsOpen}>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <Pfp image={user.image || ''} />
                                        <span className="capitalize">{user.name}</span>
                                        <ChevronUp
                                            className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-popper-anchor-width]"
                                >
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.push('/settings')}
                                    >
                                        <Settings />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => router.push('/logout')}
                                    >
                                        <LogOut />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            )}
        </>
    );
}
