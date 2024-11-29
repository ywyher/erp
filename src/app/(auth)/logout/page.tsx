'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Logout() {
    const router = useRouter();
    const queryClient = useQueryClient()

    const { data: user } = useQuery({
        queryKey: ['session', 'logout'],
        queryFn: async () => {
            const { data } = await getSession()
            return data?.user || null
        }
    })

    useEffect(() => {
        if (!user) {
            router.push('/')
        } else {
            performLogout();
        }
    }, [router, user]);

    const performLogout = async () => {
        if (!user) return
        await signOut();
        await queryClient.invalidateQueries({ queryKey: ['session'] });
        return router.push("/auth");
    }

    return (
        <div className="flex h-screen items-center justify-center" >
            <div className="text-center" >
                <p className="text-lg font-medium" > Logging out...</p>
            </div>
        </div>
    )
}
