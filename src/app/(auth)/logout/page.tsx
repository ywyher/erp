"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Logout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["session", "logout"],
    queryFn: async () => {
      const { data } = await getSession();
      return data?.user || null;
    },
  });

  
  const handleLogout = useCallback(async () => {
    if (!user) return;
    await signOut();
    queryClient.invalidateQueries({ queryKey: ["session"] });
    router.push("/");
    return;
  }, [router, user, queryClient]);
  
  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      handleLogout();
    }
  }, [router, user, handleLogout]);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium"> Logging out...</p>
      </div>
    </div>
  );
}
