"use client";

import { forgetPassword, signIn } from "@/lib/auth-client"; //import the auth client
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/app/(auth)/types";
import { useState } from "react";
import LoadingBtn from "@/components/loading-btn";
import { AuthStore, useAuthStore } from "@/app/(auth)/store";
import { z } from "zod";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getEmail } from "@/app/(auth)/actions";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const value = useAuthStore((state) => state.value);
  const context = useAuthStore((state) => state.context) as AuthStore['context'];
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      value: value || "",
      password: "",
    },
  });

  if (!value) return <>Loading...</>;

  const login = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    if (context == "email") {
      await signIn.email(
        {
          email: value || data.value,
          password: data.password,
        },
        {
          onSuccess: async () => {
            setIsLoading(false);
            router.push("/");
          },
          onError: (ctx) => {
            setIsLoading(false);
            queryClient.invalidateQueries({ queryKey: ["session"] });
            toast.error(ctx.error.message);
          },
        },
      );
    } else if (context == "phoneNumber") {
      await signIn.phoneNumber(
        {
          phoneNumber: value || data.value,
          password: data.password,
        },
        {
          onSuccess: async () => {
            setIsLoading(false);
            queryClient.invalidateQueries({ queryKey: ["session"] });
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    } else if (context == "username") {
      await signIn.username(
        {
          username: value || data.value,
          password: data.password,
        },
        {
          onSuccess: async () => {
            setIsLoading(false);
            queryClient.invalidateQueries({ queryKey: ["session"] });
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    }
  };

  const resetPassword = async () => {
    if (!value) return;
    let email;
    if (context != "email") {
      email = await getEmail({ value: value, field: context as 'username' | 'phoneNumber' })
    }

    const { error } = await forgetPassword({
      email: context == 'email' ? value : email as string,
      redirectTo: "/reset-password",
    });

    if (!error) {
      toast.success("Password Reset Link Sent Successfully", {
        description: "May Take 1-5 Minutes",
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(login)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <FormFieldWrapper
              form={form}
              disabled={true}
              name="value"
              label={context || ""}
            />
            <FormFieldWrapper
              form={form}
              type="password"
              name="password"
              label="Password"
            />
            <div>
              Forget Your Password,{" "}
              <span
                className="cursor-pointer text-blue-600 underline"
                onClick={() => resetPassword()}
              >
                Click Here
              </span>
            </div>
          </div>
          <LoadingBtn isLoading={isLoading}>Login</LoadingBtn>
        </form>
      </Form>
    </div>
  );
}
