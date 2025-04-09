import db from "@/lib/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { username } from "better-auth/plugins/username";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 8,
    minPasswordLength: 1,
    autoSignIn: false,
    sendResetPassword: async ({ url, user }) => {
      try {
        const response = await fetch(
          `${process.env.APP_URL}/api/auth/password/reset/email?name=${user.name}&email=${user.email}&url=${url}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              url: url,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        return data;
      } catch (error) {
        console.error("Failed to send reset password url:", error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID as string) || "",
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET as string) || "",
      mapProfileToUser: () => {
          return {
            provider: 'google',
          }
      }
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      onBoarding: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
      },
      gender: {
        type: "string",
        required: false,
      },
      dateOfBirth: {
        type: "string",
        required: false,
      },
      provider: {
        type: "string",
        required: true,
      },
      nationalId: {
        type: "string",
        required: false,
      },
      image: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    nextCookies(),
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          try {
            const response = await fetch(
              `${process.env.APP_URL}/api/auth/verify/email?email=${email}&otp=${otp}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
              },
            );

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
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        const email = "yassienwyh0@gmail.com";
        console.log(`code`, phoneNumber);
        console.log(`code`, code);
        // console.log(`${process.env.APP_URL}/api/auth/verify/email?email=${email}&otp=${code}`)

        const response = await fetch(
          `${process.env.APP_URL}/api/auth/verify/email?email=${email}&otp=${code}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp: code }),
          },
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        return data;

        // const response = await fetch(
        //     `${process.env.APP_URL}/api/auth/verify/phone?phoneNumber=${phoneNumber}&code=${code}`,
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({ phoneNumber, code })
        //     });

        // if (!response.ok) {
        //     throw new Error(`Error: ${response.statusText}`);
        // }

        // const data = await response.json();

        // return data;
      },
    }),
  ],
});
