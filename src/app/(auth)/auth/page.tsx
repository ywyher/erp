"use client";

import Check from "@/app/(auth)/auth/_components/check";
import AuthLayout from "@/app/(auth)/auth/_components/auth-layout";
import { useEffect, useState } from "react";
import Register from "@/app/(auth)/auth/_components/register";
import Login from "@/app/(auth)/auth/_components/login";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db/schema";

export default function Auth() {
  const router = useRouter();
  const [port, setPort] = useState<"check" | "register" | "login">("check");

  const { data: user, isLoading } = useQuery({
    queryKey: ["session", "auth"],
    queryFn: async () => {
      const { data } = await getSession();
      return (data?.user as User) || null;
    },
  });

  useEffect(() => {
    if (user) {
      router.replace("/");
      return;
    }
  }, [user]);

  return (
    <AuthLayout>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Authentication
        </h1>
      </div>
      {port === "check" && <Check setPort={setPort} />}
      {port === "register" && <Register />}
      {port === "login" && <Login />}
    </AuthLayout>
  );
}
