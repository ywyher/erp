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
import { useAuthStore } from "@/app/(auth)/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

export default function Auth() {
  const router = useRouter();
  const [port, setPort] = useState<"check" | "register" | "login">("check");

  const resetAuthStore = useAuthStore((state) => state.reset);

  const { data: user } = useQuery({
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
  }, [user, router]);

  const handleGoBack = () => {
    resetAuthStore();
    setPort("check");
  };

  return (
    <AuthLayout className={clsx(
      port != 'check' && 'gap-2'
    )}>
      {(port === "register" || port === "login") && (
        <Button
          variant="link"
          className="p-0 text-sm"
          onClick={handleGoBack}
        >
          <ArrowLeft size={12} /> Go Back
        </Button>
      )}
      {port === "check" && <Check setPort={setPort} />}
      {port === "register" && <Register />}
      {port === "login" && <Login />}
    </AuthLayout>
  );
}