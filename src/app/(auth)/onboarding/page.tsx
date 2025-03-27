"use client";

import { getSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UploadPfp from "@/components/uploadPfp";
import OnboardingForm from "@/app/(auth)/onboarding/_components/onboarding-form";
import Header from "@/components/header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateUserSchema } from "@/app/types";
import {
  checkVerificationNeeded,
  excludeField,
  normalizeData,
} from "@/lib/funcs";
import { updateOnboarding } from "@/app/(auth)/actions";
import { toast } from "sonner";
import { updateUser } from "@/lib/db/mutations";
import { User } from "@/lib/db/schema";

export default function Onboarding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [context, setContext] = useState<"email" | "phoneNumber" | null>(null);
  const queryClient = useQueryClient();

  const { data: user, isLoading: isPending } = useQuery({
    queryKey: ["session", "onboarding"],
    queryFn: async () => {
      const { data } = await getSession();
      return (data?.user as User) || null;
    },
  });

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace("/");
      return;
    }

    const handleRules = async () => {
      try {
        if (!user.onBoarding) {
          router.replace("/");
          return;
        }

        const verificationNeeded = checkVerificationNeeded(user);

        if (verificationNeeded?.value) {
          router.replace("/");
          return;
        }
      } catch (error) {
        console.error("Error in handleRules:", error);
      }
    };

    handleRules();
    setContext(user.emailVerified ? "email" : "phoneNumber");
  }, [user, router, isPending]);

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      name: "",
      username: "",
      nationalId: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof updateUserSchema>) => {
    setIsLoading(true);
    if (!user || !context) return;

    const fieldToRemove = context; // Could be "email" or "phoneNumber"
    const normalizedData = normalizeData(data, "object") as z.infer<
      typeof updateUserSchema
    >;
    const dataWithoutField = excludeField(normalizedData, fieldToRemove);

    const { success, message, error, userId } = await updateUser({
      data: dataWithoutField,
      userId: user.id,
      role: "user",
    });

    if (error) {
      setIsLoading(false);
      toast.error(error);
      return;
    }

    const updatedOnboarding = await updateOnboarding(userId || "", false);

    if (success && updatedOnboarding && updatedOnboarding.success) {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast(message);
      router.replace("/");
    }
  };

  if (!context || !user || isPending) return;

  return (
    <div>
      <Header />
      {user && (
        <div className="flex flex-col gap-5 w-full p-6 mx-auto border-x border-b border-zinc-800 sm:p-8 md:w-[70%] lg:w-[50%] xl:w-[50%] 2xl:w-[40%]">
          <p className="text-lg font-medium text-white sm:text-2xl">
            Setup your profile
          </p>
          <UploadPfp />
          <OnboardingForm
            form={form}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            context={context}
            value={
              context == "email" ? user.email || "" : user.phoneNumber || ""
            }
          />
        </div>
      )}
    </div>
  );
}