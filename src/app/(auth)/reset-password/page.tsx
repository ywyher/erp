"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { redirect, useRouter } from "next/navigation";
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
  const token = new URLSearchParams(window.location.search).get("token");

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
    <AuthLayout>
      <div className="w-full mb-6 flex flex-col space-y-6 sm:mb-8">
        <h3 className="text-2xl font-semibold text-zinc-100">
          Reset Your Password{" "}
        </h3>
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
