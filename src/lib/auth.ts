import db from "@/lib/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, username } from "better-auth/plugins"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'mysql'
    }),
    emailAndPassword: {
        enabled: true,
        maxPasswordLength: 10,
        minPasswordLength: 1,
        sendResetPassword: async (user, url) => {
            try {
                const response = await fetch(
                    `${process.env.APP_URL}/api/email/password/forget?user=${user}&url=${url}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ user, url })
                    });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();

                return data;
            } catch (error) {
                console.error("Failed to send OTP:", error);
                throw error;
            }
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string || '',
        },
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true
            },
            onBoarding: {
                type: "boolean",
                required: false,
                defaultValue: true,
                input: false,
            },
            bio: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true
            }
        }
    },
    plugins: [
        username(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "email-verification") {
                    try {
                        const response = await fetch(
                            `${process.env.APP_URL}/api/email/otp/send?email=${email}&otp=${otp}`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ email, otp })
                            });

                        if (!response.ok) {
                            throw new Error(`Error: ${response.statusText}`);
                        }

                        const data = await response.json();

                        return data;
                    } catch (error) {
                        console.error("Failed to send OTP:", error);
                        throw error;
                    }
                }
            },
            sendVerificationOnSignUp: true,
        }),
    ]
})