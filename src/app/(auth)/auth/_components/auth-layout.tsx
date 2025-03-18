import Header from "@/components/header";
import Image from "next/image";

export default function AuthLayout({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string
}) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      <Header />
      <div className="absolute inset-x-0 top-0 h-52 lg:hidden">
        <Image
          src="/images/auth.jpg"
          alt="auth"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <Image
            src="/images/auth.jpg"
            alt="auth"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex items-center justify-center p-8 lg:p-0">
          <div className="w-full max-w-sm space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}