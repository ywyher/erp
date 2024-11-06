'use client'

import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authSchema, TAuthSchema } from "@/app/(authentication)/auth.types"
import { zodResolver } from "@hookform/resolvers/zod"
import { redirect } from "next/navigation"
import { signIn, signUp } from "@/lib/auth-client"
import { checkEmailAvailability } from "@/app/(authentication)/auth.actions"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import LoadingBtn from "@/components/loading-btn"
import { faker } from '@faker-js/faker'

export default function Check(
    {
        provider,
        setPort,
        setEmail
    }: {
        provider: 'credential' | 'oauth'
        setPort: React.Dispatch<React.SetStateAction<"check" | "login">>,
        setEmail: React.Dispatch<React.SetStateAction<string | null>>
    }) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const form = useForm<TAuthSchema>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
        }
    })

    const onCheck = async (data: TAuthSchema) => {
        setIsLoading(true)
        const result = await checkEmailAvailability(data)
        if (result.available == true) {
            const randomName = faker.person.firstName()
            const randomUsername = faker.person.lastName()

            await signUp.email({
                email: data.email,
                name: randomName,
                username: randomUsername,
                password: 'password'
            }, {
                onSuccess: async () => {
                    await queryClient.invalidateQueries({ queryKey: ['session'] })
                    redirect("/verify")
                },
                onError: (ctx) => {
                    console.log(ctx.error)
                },
            })
        } else {
            if (provider == 'credential') {
                setPort('login')
                setEmail(data.email)
            } else {
                toast({
                    title: "Email exists as a google account",
                    description: "Please login with google",
                    variant: "destructive",
                })
            }
        }
        setIsLoading(false)
    }

    const onGoogleLogin = async () => {
        setIsLoading(true)
        const data = await signIn.social({
            provider: "google",
        })

        if (!data.error) {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="space-y-4">
                <Button
                    onClick={onGoogleLogin}
                    variant="outline"
                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                    disabled={isLoading} // disable button when loading
                >
                    {isLoading ? (
                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    ) : (
                        <div className="flex flex-row gap-2">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Log In with Google
                        </div>
                    )}
                </Button>

            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-zinc-400">Or</span>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onCheck)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Email"
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 hover:border-zinc-600 focus:border-zinc-500"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <LoadingBtn isLoading={isLoading} label="Authenticate" />
                </form>
            </Form>
        </div>
    )
}