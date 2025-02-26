'use client'

import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { authSchema } from "@/app/(auth)/types"
import { zodResolver } from "@hookform/resolvers/zod"
import LoadingBtn from "@/components/loading-btn"
import { checkFieldType, normalizeData } from "@/lib/funcs"
import { useAuthStore } from "@/app/(auth)/store"
import { signIn } from "@/lib/auth-client"
import { Dispatch, useState } from "react"
import { checkFieldAvailability } from "@/lib/db/queries"
import { z } from "zod"
import { FormFieldWrapper } from "@/components/form-field-wrapper"
import { toast } from "sonner"

export default function Check({ setPort }: { setPort: Dispatch<React.SetStateAction<'check' | 'register' | 'login'>> }) {
    const [isLoading, setIsLoading] = useState(false)

    const setValue = useAuthStore((state) => state.setValue)
    const setContext = useAuthStore((state) => state.setContext)

    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            field: "",
        }
    })

    const checkField = (field: string) => {
        const fieldType = checkFieldType(field)
        return fieldType as 'phoneNumber' | 'email' | 'username' | 'unknown'
    }

    const handleCheck = async (data: z.infer<typeof authSchema>) => {
        setIsLoading(true)
        
        data.field = normalizeData(data.field);
        const fieldType = checkField(data.field);

        if (fieldType == 'unknown') {
            toast.error('Only email or phone number')
            setIsLoading(false)
            return;
        }

        const { isAvailable } = await checkFieldAvailability({ field: fieldType, value: data.field})

        if (!isAvailable) {
            if (fieldType == 'email') {
                setContext('email')
            } else if(fieldType == 'phoneNumber') {
                setContext('phoneNumber')
            }else {
                setContext('username')
            }
            setValue(data.field)
            setPort('login')
        }

        if (isAvailable && fieldType == 'email') {
            setValue(data.field)
            setContext('email')
            setPort('register')
        } else if (isAvailable && fieldType == 'phoneNumber') {
            setValue(data.field)
            setContext('phoneNumber')
            setPort('register')
        }else if (isAvailable && fieldType == 'username') {
            toast.error('Username authentication only available as a login option...')
        }

        setIsLoading(false)
    }

    const onGoogleLogin = async () => {
        setIsLoading(true)
        const data = await signIn.social({
            provider: "google",
            callbackURL: 'http://localhost:3000/'
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
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    ) : (
                        <div className="flex flex-row items-center gap-2">
                            <svg width="1em" height="1em" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" /><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" /><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" /><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" /></svg>
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
                    <span className="px-2 text-zinc-400">Or</span>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheck)} className="space-y-4">
                    <div>
                        <FormFieldWrapper form={form} label="Email Or Phone number Or Username" name='field' placeholder="Email Or Phone number Or Username" />
                    </div>
                    <LoadingBtn isLoading={isLoading}>
                        Submit
                    </LoadingBtn>
                </form>
            </Form>
        </div>
    )
}