import { createAuthClient } from "better-auth/react"
import { emailOTPClient, inferAdditionalFields, phoneNumberClient, usernameClient } from "better-auth/client/plugins"
import { auth } from "@/lib/auth"

export const client = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL!,
    plugins: [
        usernameClient(),
        emailOTPClient(),
        phoneNumberClient(),
        inferAdditionalFields<typeof auth>()
    ]
})

export const {
    signUp,
    signIn,
    useSession,
    phoneNumber,
    signOut,
    emailOtp,
    getSession,
    listSessions,
    changePassword,
    updateUser,
    forgetPassword,
    resetPassword,
    listAccounts,
    revokeSession,
} = client

export type Session = typeof client.$Infer.Session
export type User = typeof client.$Infer.Session.user