"use client";

import { FieldErrors, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { registerSchema } from "@/app/(auth)/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/(auth)/store";
import LoadingBtn from "@/components/loading-btn";
import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { emailOtp, signUp } from "@/lib/auth-client";
import { generateFakeField } from "@/lib/funcs";
import { z } from "zod";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { toast } from "sonner";
import { genders } from "@/lib/constants";
import { AuthPort } from "@/components/auth/auth";
import { useIsMobile } from "@/hooks/use-mobile";

type RegisterProps = {
  email: string 
  setPassword: Dispatch<SetStateAction<string>>
  setPort: Dispatch<SetStateAction<AuthPort>>
}

export default function Register({
  email,
  setPassword,
  setPort
}: RegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: email,
      dateOfBirth: new Date(),
      gender: 'male',
      name: "ywyh",
      username: "ywyh",
      nationalId: "30801201100191",
      phoneNumber: "01558854716",
      password: "Eywyh2001@",
      confirmPassword: "Eywyh2001@",
    },
  });

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    if (!email) return;
    setIsLoading(true)
    setIsLoading(true)
    const result = await signUp.email({
        email: email || "",
        name: data.name,
        username: data.username,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
        phoneNumber: data.phoneNumber || "",
        nationalId: data.nationalId,
        role: 'user',
        image: 'pfp.jpg',
        password: data.password,
        displayUsername: data.username,
        provider: 'email'
    });

    if(result.error) {
        toast.error(result.error.message)
        setIsLoading(false)
        return;
    }
    
    const { error } = await emailOtp.sendVerificationOtp({
        email: email,
        type: "email-verification"
    })
    
    if(error) {
        toast.error(error.message)
        setIsLoading(false)
        return;
    }

    setPassword(data.password)
    setPort('verify')
  };

  const handleError = (errors: FieldErrors<z.infer<typeof registerSchema>>) => {
    const position = isMobile ? "top-center" : "bottom-right"
    const firstError = Object.values(errors)[0];

    if (firstError?.message) {
      toast.error(firstError.message, { position });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister, handleError)}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <FormFieldWrapper
                showError={false}
                disabled={true}
                form={form}
                name="email"
                label={"Email"}
                placeholder="Email"
              />
              <FormFieldWrapper
                showError={false}
                form={form}
                name="phoneNumber"
                label={"PhoneNumber"}
                placeholder="PhoneNumber"
                optional={true}
              />
            </div>
            <div className="flex flex-row gap-2">
              <FormFieldWrapper
                showError={false}
                disabled={true}
                form={form}
                name="username"
                label={"Username"}
                placeholder="Username"
              />
              <FormFieldWrapper
                showError={false}
                form={form}
                name="name"
                label={"Name"}
                placeholder="Name"
              />
            </div>
            <div className="flex flex-row gap-2">
              <FormFieldWrapper
                showError={false}
              form={form}
              name="dateOfBirth"
              label="Date of birth"
              type="date"
              />
              <FormFieldWrapper 
                showError={false}
                form={form}
                name="gender"
                label="gender"
                type="select"
                options={genders}
              />
            </div>
            <div>
              <FormFieldWrapper form={form} name="nationalId" label="National Id" />
                showError={false}
            </div>
            <div className="flex flex-row gap-2">
              <FormFieldWrapper
                showError={false}
                form={form}
                type="password"
                name="password"
                label="Password"
              />
              <FormFieldWrapper
                showError={false}
                form={form}
                type="password"
                name="confirmPassword"
                label="Confirm Password"
              />
            </div>
          </div>
          <div className="mt-2">
            <LoadingBtn isLoading={isLoading}>Register</LoadingBtn>
          </div>
        </form>
      </Form>
    </div>
  );
}
