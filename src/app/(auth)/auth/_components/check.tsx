"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { authSchema } from "@/app/(auth)/types";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingBtn from "@/components/loading-btn";
import { checkFieldType, normalizeData } from "@/lib/funcs";
import { useAuthStore } from "@/app/(auth)/store";
import { signIn } from "@/lib/auth-client";
import { Dispatch, useState } from "react";
import { checkFieldAvailability } from "@/lib/db/queries";
import { z } from "zod";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { toast } from "sonner";
import Google from "@/components/svg/google";


export default function Check({
  setPort,
}: {
  setPort: Dispatch<React.SetStateAction<"check" | "register" | "login">>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const setValue = useAuthStore((state) => state.setValue);
  const setContext = useAuthStore((state) => state.setContext);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      field: "",
    },
  });

  const checkField = (field: string) => {
    const fieldType = checkFieldType(field);
    return fieldType as "phoneNumber" | "email" | "username" | "unknown";
  };

  const handleCheck = async (data: z.infer<typeof authSchema>) => {
    setIsLoading(true);

    data.field = normalizeData(data.field);
    const fieldType = checkField(data.field);

    if (fieldType == "unknown") {
      toast.error("Only email or phone number");
      setIsLoading(false);
      return;
    }

    const { isAvailable } = await checkFieldAvailability({
      field: fieldType,
      value: data.field,
    });

    if (!isAvailable) {
      if (fieldType == "email") {
        setContext("email");
      } else if (fieldType == "phoneNumber") {
        setContext("phoneNumber");
      } else {
        setContext("username");
      }
      setValue(data.field);
      setPort("login");
    }

    if (isAvailable && fieldType == "email") {
      setValue(data.field);
      setContext("email");
      setPort("register");
    } else if (isAvailable && fieldType == "phoneNumber") {
      setValue(data.field);
      setContext("phoneNumber");
      setPort("register");
    } else if (isAvailable && fieldType == "username") {
      toast.error(
        "Username authentication only available as a login option...",
      );
    }

    setIsLoading(false);
  };

  const onGoogleLogin = async () => {
    setIsLoading(true);
    const data = await signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000/",
    });

    if (!data.error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <LoadingBtn
          onClick={onGoogleLogin}
          variant="outline"
          className="w-full"
          disabled={isLoading}
          isLoading={isLoading}
        >
          <Google /> Log In with Google
        </LoadingBtn>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-zinc-400">Or</span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCheck)} className="space-y-4">
          <div>
            <FormFieldWrapper
              form={form}
              name="field"
              placeholder="Email Or Phone number Or Username"
            />
          </div>
          <LoadingBtn isLoading={isLoading}>Submit</LoadingBtn>
        </form>
      </Form>
    </div>
  );
}