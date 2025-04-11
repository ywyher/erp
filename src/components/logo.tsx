import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface LogoProps {
  size?: number;
  type?: "full" | "icon";
  className?: string;
}

const Logo: FC<LogoProps> = ({ size = 110, type = "full", className = "" }) => {
  return (
    <Link 
      href="/"
      className={`inline-flex items-center ${className}`}
    >
      {type === "full" ? (
        <div className="flex items-center">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Perfect Health logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="ml-2 whitespace-nowrap">
            <span className="text-primary font-semibold tracking-tight font-sans">Perfect</span>
            <span className="font-semibold tracking-tight font-sans ml-1">Health</span>
          </div>
        </div>
      ) : (
        <div className="relative w-10 h-10">
          <Image
            src="/images/logo.png"
            alt="Perfect Health logo"
            fill
            className="object-contain"
          />
        </div>
      )}
    </Link>
  );
};

export default Logo;