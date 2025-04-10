import FloatingCard from "@/components/home/hero/floating-card";
import { Clock, Users } from "lucide-react";
import Image from "next/image";

export default function Right() {
 return (
    <div className="grid place-items-center w-[500px] h-[500px]">
        <div className="relative w-full h-full 
            border-[2rem] border-gray-200 dark:border-gray-700
            rounded-full 
            shadow-2xl 
            flex items-center justify-center
            bg-gradient-to-br from-indigo-50 to-white
            dark:from-indigo-900/30 dark:to-black/30
        ">
            <div className="
                absolute 
                w-[400px] h-[400px] 
                bg-gradient-to-br from-primary to-secondary
                rounded-full 
                flex items-end justify-center
                shadow-[0_35px_60px_-15px_hsla(215,85%,30%,0.3)]
                dark:shadow-[0_35px_60px_-15px_hsla(215,70%,40%,0.5)]
                hover:scale-[1.02] 
                transition-transform 
                duration-300 
                ease-in-out
            ">
                <FloatingCard 
                    title="Well qualified doctors" 
                    description='Treat with care'
                    Icon={Users}
                    className="-top-16 -left-24 rotate-[-5deg]"
                />
                <FloatingCard
                    title="Book an appointment" 
                    description='At your fingertips'
                    Icon={Clock}
                    className="
                        top-44 left-48 md:left-64 z-10 
                        w-[280px] rotate-[5deg]
                    "
                />
                <div className="
                    relative 
                    w-[500px] h-[500px]
                ">
                    <Image
                        src="/images/cleft.png"
                        alt="Profile Picture"
                        fill
                        className="object-cover rounded-full"
                        priority
                    />
                </div>
            </div>
        </div>
    </div>
 )
}