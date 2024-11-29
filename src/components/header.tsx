'use client'

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSession, User } from "@/lib/auth-client";

import {
    LogOut,
    Settings,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { redirect, useRouter } from "next/navigation";
import Pfp from "@/components/pfp";
import { useEffect } from "react";

function Dropdown({ user }: { user: User }) {
    const queryClient = useQueryClient()
    const router = useRouter();

    if (!user) return;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
                <Pfp image={user.image || ''} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('settings')}>
                        <Settings />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/logout')}>
                    <LogOut />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function Header() {
    const { data: user } = useQuery({
        queryKey: ['session', 'header'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    return (
        <nav>
            <div className="relative flex w-full items-center justify-between border-b border-b-zinc-800 bg-black py-2 px-4 ">
                <div className="flex flex-row gap-3 items-center">
                    <Link href="/" className="text-xl font-bold">Header</Link>
                    <div>
                        {user && (
                            <>
                                <Link href="/dashboard">Dashboard</Link>
                            </>
                        )}
                    </div>
                </div>
                {user ? (
                    <Dropdown user={user} />
                ) : (
                    <div className="ml-4 flex items-center space-x-4 text-zinc-300 md:ml-8 lg:ml-6 lg:space-x-6">
                        <Link className="text-lg min-w-max rounded-full bg-zinc-200 px-4 py-1 font-medium text-black" href="/auth">Auth</Link>
                    </div>
                )}
            </div>
        </nav >
    )
}