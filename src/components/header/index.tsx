'use client'

import Link from "next/link";
import { useQuery } from "@tanstack/react-query"
import { getSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { User } from "@/lib/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "@/components/header/menu";
import Links from "@/components/header/links";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function Header() {
    const { data: user } = useQuery({
        queryKey: ["session", "header"],
        queryFn: async () => {
            const { data } = await getSession();
            return data?.user as User || null;
        },
    });

    const isMobile = useIsMobile(); // Call it once here

    return (
        <nav className={`
            flex items-center justify-between w-full px-6 border-b-2 border-b-zinc-800
            ${isMobile && `py-3`}
        `}>
            {!isMobile ? (
                <>
                    <div className="flex items-center gap-8">
                            <Logo />
                            <div className="flex items-center gap-6">
                            <Links
                                user={user || null}
                                isMobile={isMobile}
                            />
                        </div>
                    </div>
        
                    <div className="flex-1"></div>
                </>
            ): (
                <>
                    <Logo />
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <Links
                                user={user || null}
                                isMobile={isMobile}
                                isLabel={false}
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center gap-4">
                <ThemeToggle />
                {user ? (
                    <Menu user={user} isMobile={isMobile} /> // Pass isMobile as a prop
                ) : (
                    <Link href="/auth">
                        <Button variant='outline' className='rounded-full'>
                            Auth
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    );
}