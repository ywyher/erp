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

export default function Auth() {
  const router = useRouter();
  const [port, setPort] = useState<"check" | "register" | "login">("check");

  const value = useAuthStore((state) => state.value);
  const context = useAuthStore((state) => state.context);
  const resetAuthStore = useAuthStore((state) => state.reset);

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

  const handleGoBack = () => {
    resetAuthStore();
    setPort("check");
  };

  return (
    <AuthLayout>
      {(port === "register" || port === "login") && (
        <Button
          variant="link"
          className="flex items-center gap-2 p-0 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          onClick={handleGoBack}
        >
          <ArrowLeft size={12} /> Go Back
        </Button>
      )}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Authentication</h1>
      </div>
      {port === "check" && <Check setPort={setPort} />}
      {port === "register" && <Register />}
      {port === "login" && <Login />}
    </AuthLayout>
  );
}