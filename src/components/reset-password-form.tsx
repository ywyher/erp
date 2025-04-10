"use client"

import { z } from "zod"
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import LoadingBtn from "@/components/loading-btn"
import { passwordSchema } from "@/app/types"
import { resetPassword } from "@/lib/auth-client"

type ResetPasswordValues = z.infer<typeof passwordSchema>

export function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()
  const router = useRouter()

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true)

    const { error } = await resetPassword({
      newPassword: data.password,
      token,
    });

    if(error) {
      toast.error(error.message)
      setIsLoading(false)
      return;
    }
    
    setIsLoading(false)
    toast.success("Password reset successfully")
    router.replace('/')
  }

  const onError = (errors: FieldErrors<ResetPasswordValues>) => {
      const position = isMobile ? "top-center" : "bottom-right"
      const firstError = Object.values(errors)[0];

      if (firstError?.message) {
        toast.error(firstError.message, { position });
      }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4 max-w-md">
        <FormFieldWrapper
          form={form}
          type="password"
          name="password"
          label="password"
          showError={false}
        />
        <FormFieldWrapper
          form={form}
          type="password"
          name="confirmPassword"
          label="Confirm password"
          showError={false}
        />
        <LoadingBtn isLoading={isLoading} className="w-full">
          Reset Password
        </LoadingBtn>
      </form>
    </Form>
  )
}