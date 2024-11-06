import { createAuthClient } from "better-auth/react"
import { emailOTPClient, inferAdditionalFields, usernameClient } from "better-auth/client/plugins"
import { auth } from "@/lib/auth"

export const client = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL! || 'http://localhost:3000',
    plugins: [
        usernameClient(),
        emailOTPClient(),
        inferAdditionalFields<typeof auth>()
    ]
})

export const {
    signUp,
    signIn,
    useSession,
    signOut,
    emailOtp,
    getSession,
    listSessions,
    changePassword,
    updateUser,
    forgetPassword,
    resetPassword,
    listAccounts
} = client

export type TSession = typeof client.$Infer.Session