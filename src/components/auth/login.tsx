"use client";

import { emailOtp, forgetPassword, signIn, signOut } from "@/lib/auth-client"; //import the auth client
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/app/(auth)/types";
import { Dispatch, SetStateAction, useState } from "react";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getEmail } from "@/app/(auth)/actions";
import { useQueryClient } from "@tanstack/react-query";
import { AuthIdentifier, AuthPort } from "@/components/auth/auth";
import { getEmailByPhoneNumber, getEmailByUsername, isFieldVerified } from "@/lib/db/queries";

type LoginProps = {
  identifierValue: string 
  identifier: AuthIdentifier
  setPort: Dispatch<SetStateAction<AuthPort>>
  setOpen: Dispatch<SetStateAction<boolean>>
  setPassword: Dispatch<SetStateAction<string>>
}

export default function Login({
  identifierValue, 
  identifier,
  setPort,
  setOpen,
  setPassword
}: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      field: identifierValue || "",
      password: "",
    },
  });

  if (!identifierValue) return <>Loading...</>;

  const login = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    let authData;
    if (identifier == "email") {
      authData = await signIn.email({
        email: identifierValue || data.field,
        password: data.password,
      });
    } else if (identifier == "phoneNumber") {
      authData = await signIn.phoneNumber({
        phoneNumber: identifierValue || data.field,
        password: data.password,
      });
    } else if (identifier == "username") {
      authData = await signIn.username({
        username: identifierValue || data.field,
        password: data.password,
      });
    }

    if(authData?.error) {
      setIsLoading(false);
      toast.error(authData?.error.message);
      return;
    }

    const { isVerified } = await isFieldVerified({ field: 'email', value: identifierValue })

    if(!isVerified) {
      await signOut();
      let email: string | null = identifierValue
      if(identifier == 'username') {
        email = await getEmailByUsername({ username: data.field }) || null
      }else if(identifier == 'phoneNumber') {
        email = await getEmailByPhoneNumber({ phoneNumber: data.field }) || null
      }

      if(!email) {
        toast.error("Failed to get email")
        return
      }

      const { error } = await emailOtp.sendVerificationOtp({
        email: email,
        type: "email-verification"
      })

      if(error) {
        toast.error(error.message)
      }

      setPassword(data.password)
      setPort('verify')
      return
    }

    setIsLoading(false);
    queryClient.invalidateQueries({ queryKey: ["session"] });
    setPort('check')
    setOpen(false)
  };

  const resetPassword = async () => {
    if (!identifierValue) return;
    let email;
    if (identifier != "email") {
      email = await getEmail({ value: identifierValue, field: identifier as 'username' | 'phoneNumber' })
    }

    const { error } = await forgetPassword({
      email: identifier == 'email' ? identifierValue : email as string,
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
              name="field"
              label={identifier || ""}
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
