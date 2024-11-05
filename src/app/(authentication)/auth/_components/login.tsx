"use client"

import { forgetPassword, signIn } from "@/lib/auth-client"; //import the auth client
import { Button } from "@/components/ui/button"
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
import { loginSchema, TLoginSchema } from "@/app/(authentication)/auth.types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingBtn from "@/components/loading-btn";

export default function Login({ email }: { email: string }) {
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(false);

    const login = async (data: TLoginSchema) => {
        setIsLoading(true)
        const login = await signIn.email({
            email: data.email,
            password: data.password,
        }, {
            onRequest: (ctx) => {
                //show loading
            },
            onSuccess: (ctx) => {
                //redirect to the dashboard
                redirect("/")
            },
            onError: (ctx) => {
                alert(ctx.error.message);
            },
        });
        setIsLoading(false)
    };


    const form = useForm<TLoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: email,
            password: "",
        }
    });

    const resetPassword = async () => {
        const { data, error } = await forgetPassword({
            email: email,
            redirectTo: "/reset-password",
        });

        if (!error) {
            toast({
                title: "Password Reset Link Sent Successfully",
                description: "May Take 1-5 Minutes",
            })
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(login)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input disabled placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>Forget Your Password, <span className="cursor-pointer text-blue-600 underline" onClick={() => resetPassword()}>Click Here</span></div>
                    </div>
                    <LoadingBtn isLoading={isLoading} label="Login" />
                </form>
            </Form>
        </div>
    );
}