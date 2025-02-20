'use client'

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/app/(auth)/store";
import { emailOtp, getSession, phoneNumber } from "@/lib/auth-client";
import { checkVerificationNeeded } from "@/lib/funcs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "@/lib/db/schema";

export default function Rules() {
  const router = useRouter();
  const pathname = usePathname(); // Get current page path
  const setValue = useAuthStore((state) => state.setValue);
  const setContext = useAuthStore((state) => state.setContext);
  const setOperation = useAuthStore((state) => state.setOperation);

  const { data: user, isLoading } = useQuery({
    queryKey: ['session', 'rules'],
    queryFn: async () => {
      const { data } = await getSession();
      return data?.user as User || null;
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    // Prevent OTP resend if user is already on /verify page
    if (pathname === "/verify") return;

    const handleRules = async () => {
      try {
        const verificationNeeded = checkVerificationNeeded(user);

        if(verificationNeeded) {
          // Store the verification type & value and redirect to /verify
          setValue(verificationNeeded.value);
          setContext(verificationNeeded.type);
          setOperation("verify");
          router.replace("/verify");
          return; 
        }
        
        if (user.onBoarding) {
          router.replace("/onboarding");
          return; 
        }
      } catch (error) {
        toast.error(`Error in handleRules: ${error}`);
      }
    };

    handleRules();
  }, [user, router, isLoading, pathname]);

  return null;
}