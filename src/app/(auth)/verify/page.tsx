"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { verifyOtpSchema } from "@/app/(auth)/types";
import { emailOtp, phoneNumber, signUp } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import VerifyForm from "@/app/(auth)/verify/_components/verify-form";
import { useAuthStore } from "@/app/(auth)/store";
import { updatePhoneNumberVerified } from "@/app/(auth)/actions";
import { useQueryClient } from "@tanstack/react-query";
import { generateFakeField } from "@/lib/funcs";
import { z } from "zod";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/app/(auth)/auth/_components/auth-layout";
import { Separator } from "@/components/ui/separator";

export default function Verify() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  // Zustand store
  const {
    value,
    context,
    operation,
    password,
    redirectTo,
    otpExists,
    setOtpExists,
    reset,
  } = useAuthStore((state) => state);

  // Detect when Zustand store has hydrated
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Prevent redirects before hydration is complete
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration
    if (!value || !context) {
      router.replace("/");
      return;
    }
    if (operation === "register" && !password) {
      router.replace("/");
      return;
    }

    console.log(otpExists);

    const sendOtp = async () => {
      try {
        if (context === "phoneNumber") {
          console.log("test");
          await phoneNumber.sendOtp(
            { phoneNumber: value },
            {
              onSuccess: () => {
                setOtpExists(true);
                toast.success("OTP sent to phone.");
              },
              onError: (ctx) => {
                toast.error(ctx.error.message);
              },
            },
          );
        } else if (context === "email") {
          await emailOtp.sendVerificationOtp(
            { email: value, type: "email-verification" },
            {
              onSuccess: () => {
                setOtpExists(true);
                toast.success("OTP sent successfully.");
              },
              onError: (ctx) => {
                toast.error(ctx.error.message);
              },
            },
          );
        }
      } catch (error) {
        toast.error(`Error sending OTP: ${error}`);
      }
    };

    if (!otpExists) {
      sendOtp();
    }
  }, [isHydrated, value, context, operation, password, otpExists, router, setOtpExists]);

  const form = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
  });

  const onVerify = async (data: z.infer<typeof verifyOtpSchema>) => {
    setIsLoading(true);
    if (!value) return;

    const onSuccessRedirect = async () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      setIsLoading(false);
      reset(); // This clears Zustand state

      // **Delay redirection slightly to avoid hydration conflict**
      setTimeout(() => {
        if (redirectTo) {
          router.replace(redirectTo);
        } else if (operation == "register") {
          router.replace("/onboarding"); // Ensure this doesn't trigger an unintended redirect
        } else {
          router.replace("/");
        }
      }, 100);
    };

    if (context === "email") {
      await emailOtp.verifyEmail(
        {
          email: value,
          otp: data.otp,
        },
        {
          onSuccess: onSuccessRedirect,
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    } else if (context === "phoneNumber") {
      await phoneNumber.verify(
        {
          phoneNumber: value,
          code: data.otp,
        },
        {
          onSuccess: async () => {
            if (operation === "register") {
              if (!password) return;
              const username = generateFakeField("username");
              const name = generateFakeField("name");
              const email = generateFakeField("email", value); // value: password

              if (!username || !email || !name) throw new Error("errorrrrr");

              const { data, error } = await signUp.email({
                phoneNumber: value,
                email: email,
                username: username,
                name: name,
                password: password,
                provider: "phoneNumber"
              });

              if (error) console.error(error.message);

              const phoneNumberVerifiedUpdated =
                await updatePhoneNumberVerified(data?.user.id || "");

              if (!phoneNumberVerifiedUpdated)
                console.error("Phone number verified field not updated");

              onSuccessRedirect();
              return;
            } else {
              onSuccessRedirect();
            }
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    }
  };

  const onSendOtp = async () => {
    if (!value) return;
    setIsLoading(true);
    if (context === "email") {
      await emailOtp.sendVerificationOtp(
        {
          email: value,
          type: "email-verification",
        },
        {
          onSuccess: () => {
            toast("OTP Sent", {
              description: "Check your email and verify your account",
            });
            setIsLoading(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    } else if (context === "phoneNumber") {
      await phoneNumber.sendOtp(
        {
          phoneNumber: value,
        },
        {
          onSuccess: () => {
            toast("OTP Sent", {
              description: "Check your email and verify your account",
            });
            setIsLoading(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    }
  };

  if (!isHydrated || !value || !context) return null; // Prevent rendering before hydration

  const title = context == 'email' ? "Check your inbox" : "Check you messages"

  return (
    <AuthLayout title={title}>
      <div className="w-full flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-teal-500">{value}</p>
            <p className="text-gray-400">
              If this account exists, you will receive an {context} with a One
              Time Password (OTP). Type your OTP here to log in:
            </p>
          </div>
          <VerifyForm form={form} onVerify={onVerify} isLoading={isLoading} />
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <Button variant="destructive" onClick={() => router.push("/logout")}>
            Logout
          </Button>
          <Button variant="outline" onClick={onSendOtp}>
            Didn’t receive an email? Click here to resend
          </Button>
          <p className="text-sm text-gray-400">
            Emails may take up to 5 minutes to arrive. If you did not receive an
            email or your code did not work, please try again. If you encounter
            any issues, please visit our{" "}
            <span className="text-blue-500 hover:cursor-pointer hover:text-blue-400">
              support
            </span>{" "}
            page.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
