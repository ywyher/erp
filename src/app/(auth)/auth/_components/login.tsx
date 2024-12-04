"use client"

import { forgetPassword, signIn } from "@/lib/auth-client"; //import the auth client
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { loginSchema } from "@/app/(auth)/types";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingBtn from "@/components/loading-btn";
import { useVerifyStore } from "@/app/(auth)/store";
import { z } from "zod";
import { FormFieldWrapper } from "@/components/formFieldWrapper";
import { getErrorMessage } from "@/lib/handle-error";
import { toast } from "sonner";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const value = useVerifyStore((state) => state.value)
    const context = useVerifyStore((state) => state.context)

    if (!value) return <>Loading...</>

    const login = async (data: z.infer<typeof loginSchema>) => {
        setIsLoading(true)
        if (context == 'email') {
            await signIn.email({
                email: value || data.value,
                password: data.password,
            }, {
                onSuccess: () => {
                    setIsLoading(false)
                    redirect("/")
                },
                onError: (ctx) => {
                    getErrorMessage(ctx.error.message);
                    setIsLoading(false)
                },
            });
        } else if (context == 'phoneNumber') {
            const { error } = await signIn.phoneNumber({
                phoneNumber: value || data.value,
                password: data.password,
            })
        }
    }


    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            value: value || '',
            password: "",
        }
    });

    const resetPassword = async () => {
        if (!value) return;
        if (context != 'email') {
            toast("Password Reset functionality only works for emals at the moment", {
                description: "May Take 1-5 Minutes",
            })
            return;
        }

        const { error } = await forgetPassword({
            email: value,
            redirectTo: "/reset-password",
        });

        if (!error) {
            toast('Password Reset Link Sent Successfully', {
                description: "May Take 1-5 Minutes",
            })
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(login)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <FormFieldWrapper form={form} disabled={true} name="value" label={context || ""} />
                        <FormFieldWrapper form={form} name="password" label='Password' />
                        <div>Forget Your Password, <span className="cursor-pointer text-blue-600 underline" onClick={() => resetPassword()}>Click Here</span></div>
                    </div>
                    <LoadingBtn isLoading={isLoading} label="Login" />
                </form>
            </Form>
        </div>
    );
}