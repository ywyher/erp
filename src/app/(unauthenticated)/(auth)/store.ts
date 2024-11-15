import { create } from 'zustand'

type VerifyStore = {
    value: string | null,
    context: 'email' | 'phoneNumber' | null,
    password: string | null,
    setContext: (context: 'email' | 'phoneNumber') => void,
    setValue: (value: string) => void
    setPassword: (password: string) => void

}

export const useVerifyStore = create<VerifyStore>((set) => ({
    value: null,
    context: null,
    password: null,
    setContext: (context: VerifyStore['context']) => set((state) => ({ context: context })),
    setValue: (value: VerifyStore['value']) => set((state) => ({ value: value })),
    setPassword: (password: VerifyStore['password']) => set((state) => ({ password: password }))
}))