"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/app/(auth)/auth/_components/auth-layout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { resetPassword } from "@/lib/auth-client";
import { passwordSchema } from "@/app/types";
import { toast } from "sonner";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Get the token from the URL

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onResetPassword = async (formData: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    if (!token) {
      // Handle the error
      toast.error(`Invlid Token Redirecting...`);
      router.replace(`/auth`);
      setIsLoading(false);
      return;
    }
    const { error } = await resetPassword({
      newPassword: formData.password,
      token,
    });

    if (error) {
      console.error(error.message);
    } else {
      toast("Password reset successfully");
      setIsLoading(false);
      redirect("/auth");
    }
  };

  return (
    <AuthLayout title="Reset Your Password">
      <div className="w-full flex flex-col gap-2">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onResetPassword)}
          >
            <div className="flex flex-col gap-1">
              <FormFieldWrapper
                form={form}
                type="password"
                name="password"
                label="password"
              />
              <FormFieldWrapper
                form={form}
                type="password"
                name="confirmPassword"
                label="Confirm password"
              />
            </div>
            <LoadingBtn isLoading={isLoading}>Update</LoadingBtn>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
