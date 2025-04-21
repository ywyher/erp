"use client";

import { FieldErrors, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { authSchema } from "@/components/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingBtn from "@/components/loading-btn";
import { checkIdentifier, normalizeData } from "@/lib/funcs";
import { signIn } from "@/lib/auth-client";
import { Dispatch, useState } from "react";
import { checkFieldAvailability } from "@/lib/db/queries";
import { z } from "zod";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { toast } from "sonner";
import { AuthIdentifier, AuthPort } from "@/components/auth/auth";
import { useIsMobile } from "@/hooks/use-mobile";


type CheckProps = {
  setPort: Dispatch<React.SetStateAction<AuthPort>>;
  setIdentifierValue: Dispatch<React.SetStateAction<string>>;
  setIdentifier: Dispatch<React.SetStateAction<AuthIdentifier | null>>;
}

export default function Check({
  setPort,
  setIdentifierValue,
  setIdentifier,
}: CheckProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile()

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      field: "",
    },
  });

  const handleCheck = async (data: z.infer<typeof authSchema>) => {
    setIsLoading(true);

    data.field = normalizeData(data.field);
    const identifier = checkIdentifier(data.field);

    if (identifier == "unknown") {
      toast.error("Please use email or phone number or username");
      setIsLoading(false);
      return;
    }

    const { isAvailable } = await checkFieldAvailability({
      field: identifier,
      value: data.field,
    });

    if (!isAvailable) {
      setIdentifier(identifier);
      setIdentifierValue(data.field);
      setPort("login");
    }

    if (isAvailable) {
      if(identifier == "email") {
        setIdentifierValue(data.field);
        setIdentifier("email");
        setPort("register");
      }else {
        toast.error("You can only register using email")
      }
    }

    setIsLoading(false);
  };

  const handleError = (errors: FieldErrors<z.infer<typeof authSchema>>) => {
    const position = isMobile ? "top-center" : "bottom-right"
    if (errors.field) {
      toast.error(errors.field.message, { position });
    }
  }

  // const onGoogleLogin = async () => {
  //   setIsLoading(true);
  //   const data = await signIn.social({
  //     provider: "google",
  //     callbackURL: process.env.NEXT_PUBLIC_APP_URL,
  //   });

  //   if (!data) {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="flex flex-col gap-6">
      {/* <div>
        <LoadingBtn
          onClick={onGoogleLogin}
          variant="outline"
          className="w-full"
          disabled={isLoading}
          isLoading={isLoading}
        >
          <Google /> Log In with Google
        </LoadingBtn>
      </div> */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-zinc-400">Or</span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCheck, handleError)} className="space-y-4">
          <div>
            <FormFieldWrapper
              form={form}
              name="field"
              placeholder="Email Or Phone number Or Username"
              showError={false}
            />
          </div>
          <LoadingBtn isLoading={isLoading}>Continue</LoadingBtn>
        </form>
      </Form>
    </div>
  );
}