import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Logo from "@/components/logo";

export default function AuthLayout({
  children,
  className = "",
  title = "Authenticate"
}: {
  children: React.ReactNode;
  className?: string;
  title?: string
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Mobile Image with Gradient */}
      <div className="relative lg:hidden h-52 mb-[-10rem]">
        <Image
          src="/images/auth.jpg"
          alt="Authentication background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        
        {/* App Logo */}
        <Logo size={150} className="absolute top-4 left-4 z-10" />
      </div>

      {/* Main Content Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2">
        {/* Desktop Image */}
        <div className="relative hidden lg:block">
          <Image
            src="/images/auth.jpg"
            alt="Authentication background"
            fill
            className="object-cover"
            priority
          />
          {/* App Logo for Desktop */}
          <Logo size={150} className="absolute top-4 left-4 z-10" />
        </div>

        {/* Content Area */}
        <div className="flex items-center justify-center p-8 lg:p-0 bg-muted dark:bg-zinc-950">
          <Card 
            className={`
              flex flex-col gap-5 
              w-full max-w-sm 
              bg-background 
              ${className}
            `}
          >
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl font-normal">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}