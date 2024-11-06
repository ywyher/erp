'use client'

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSession, signOut, TSession } from "@/lib/auth-client";

import {
    LogOut,
    Settings,
    User,
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
import { redirect } from "next/navigation";
import Pfp from "@/components/pfp";

function Dropdown({ session }: { session: TSession }) {
    const queryClient = useQueryClient()

    const handleLogout = async () => {
        await signOut()
        queryClient.invalidateQueries({ queryKey: ['session'] })
    }

    const handleRedirect = (page: 'settings' | 'profile') => {
        if (page == 'settings') {
            redirect('/settings')
        }
    }

    if (!session || !session.user) return;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
                <Pfp image={session.user.image} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {/* <DropdownMenuItem>
                        <User />
                        <span>Profile</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleRedirect('settings')}>
                        <Settings />
                        <span>Settings</span>
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()}>
                    <LogOut />
                    <span>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export default function Header() {
    const { data: session } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await getSession()
            return data
        }
    })

    return (
        <nav>
            <div className="relative flex w-full items-center justify-between border-b border-b-zinc-800 bg-black py-2 px-4 ">
                <div>
                    <Link href="/" className="text-xl font-bold">Header</Link>
                </div>
                {session && session.user ? (
                    <Dropdown session={session} />
                ) : (
                    <div className="ml-4 flex items-center space-x-4 text-zinc-300 md:ml-8 lg:ml-6 lg:space-x-6">
                        <Link className="text-lg min-w-max rounded-full bg-zinc-200 px-4 py-1 font-medium text-black" href="/auth">Auth</Link>
                    </div>
                )}
            </div>
        </nav >
    )
}