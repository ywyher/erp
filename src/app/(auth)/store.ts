import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthStore = {
  value: string | null;
  context: "email" | "phoneNumber" | null;
  password: string | null;
  operation: "register" | "verify" | null;
  redirectTo: string | null;
  otpExists: boolean | null;
  setContext: (context: "email" | "phoneNumber" | "username") => void;
  setValue: (value: string) => void;
  setPassword: (password: string) => void;
  setOperation: (operation: "register" | "verify" | null) => void;
  setRedirectTo: (redirectTo: string | null) => void;
  setOtpExists: (otpExists: boolean | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      value: null,
      context: null,
      password: null,
      operation: "register",
      redirectTo: "",
      otpExists: false,
      setContext: (context) => set({ context }),
      setValue: (value) => set({ value }),
      setPassword: (password) => set({ password }),
      setOperation: (operation) => set({ operation }),
      setRedirectTo: (redirectTo) => set({ redirectTo }),
      setOtpExists: (otpExists) => set({ otpExists }),
      reset: () => {
        set({
          value: null,
          context: null,
          password: null,
          operation: null,
          redirectTo: null,
          otpExists: false,
        });
      },
    }),
    {
      name: "auth-store", // Name of the storage key
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage
    },
  ),
);
