import { create } from 'zustand'

type VerifyStore = {
    value: string | null,
    context: 'email' | 'phoneNumber' | null,
    password: string | null,
    operation: 'register' | 'verify',
    redirectTo: string,
    setContext: (context: 'email' | 'phoneNumber') => void,
    setValue: (value: string) => void
    setPassword: (password: string) => void
    setOperation: (operation: 'register' | 'verify') => void
    setRedirectTo: (redirectTo: string) => void
}

export const useVerifyStore = create<VerifyStore>((set) => ({
    value: null,
    context: null,
    password: null,
    operation: 'register',
    redirectTo: '',
    setContext: (context: VerifyStore['context']) => set((state) => ({ context: context })),
    setValue: (value: VerifyStore['value']) => set((state) => ({ value: value })),
    setPassword: (password: VerifyStore['password']) => set((state) => ({ password: password })),
    setOperation: (operation: VerifyStore['operation']) => set((state) => ({ operation: operation })),
    setRedirectTo: (redirectTo: VerifyStore['redirectTo']) => set((state) => ({ redirectTo: redirectTo }))
}))