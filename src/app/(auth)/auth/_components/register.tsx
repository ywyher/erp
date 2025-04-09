"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { registerSchema } from "@/app/(auth)/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/(auth)/store";
import LoadingBtn from "@/components/loading-btn";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { generateFakeField } from "@/lib/funcs";
import { z } from "zod";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { toast } from "sonner";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const value = useAuthStore((state) => state.value);
  const context = useAuthStore((state) => state.context);
  const setOperation = useAuthStore((state) => state.setOperation);
  const setPassword = useAuthStore((state) => state.setPassword);

  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      field: value || "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    if (!value) return;
    setIsLoading(true)
    if (context == "email") {
      const username = generateFakeField("username");
      const name = generateFakeField("name") || "";

      await signUp.email(
        {
          email: value,
          username: username,
          name: name,
          password: data.password,
          provider: 'email',
        },
        {
          onSuccess: async () => {
            // Store the verification type & value and redirect to /verify
            setOperation("register");
            setPassword(data.password);
            router.push("/verify");
            return;
          },
          onError: (ctx) => {
            console.error(ctx.error.message)
            toast.error(ctx.error.message);
            setIsLoading(false)
          },
        },
      );
    } else if (context == "phoneNumber") {
      setOperation("register");
      setPassword(data.password);
      router.push("/verify");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister)}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-2">
            <FormFieldWrapper
              disabled={true}
              form={form}
              name="field"
              label={context || ""}
              placeholder="Email Or Phone number"
            />
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
              label="Confirm Password"
            />
          </div>
          <div className="mt-2">
            <LoadingBtn isLoading={isLoading}>Register</LoadingBtn>
          </div>
        </form>
      </Form>
    </div>
  );
}
