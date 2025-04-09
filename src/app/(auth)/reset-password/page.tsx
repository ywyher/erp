"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/app/(auth)/auth/_components/auth-layout";
import { useState, Suspense } from "react";
import { resetPassword } from "@/lib/auth-client";
import { passwordSchema } from "@/app/types";
import { toast } from "sonner";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";

// Create a separate client component for handling search params
function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Use Next.js's useSearchParams hook instead of window.location
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
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
      toast.error(`Invalid Token. Redirecting...`);
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
      toast.error("Failed to reset password");
      setIsLoading(false);
    } else {
      toast.success("Password reset successfully");
      setIsLoading(false);
      router.push("/auth");
    }
  };
  
  return (
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
            label="Password"
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
  );
}

// The main component now uses Suspense
export default function ResetPassword() {
  return (
    <AuthLayout title="Reset Your Password">
      <div className="w-full flex flex-col gap-2">
        <Suspense fallback={<div>Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </AuthLayout>
  );
}