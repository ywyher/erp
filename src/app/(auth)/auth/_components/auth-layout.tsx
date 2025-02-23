import Header from "@/components/header"
import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen">
            <Header />
            <div className="absolute inset-x-0 top-0 h-52 md:hidden">
                <Image
                    src="/images/auth.jpg"
                    alt="auth"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
            <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
                <div className="relative hidden md:block">
                    <Image
                        src="/images/auth.jpg"
                        alt="auth"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="flex items-center justify-center bg-black p-8 md:p-0">
                    <div className="w-full max-w-sm space-y-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}