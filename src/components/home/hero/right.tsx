import FloatingCard from "@/components/home/hero/floating-card";
import { Clock, Users } from "lucide-react";
import Image from "next/image";

export default function Right() {
 return (
    <div className="grid place-items-center w-full max-w-[500px] h-[500px] relative">
        <div className="relative w-full h-full 
            md:border-[2rem] border-gray-300 dark:border-gray-800
            rounded-full shadow-2xl 
            flex items-center justify-center
            md:bg-gradient-to-br from-indigo-50 to-white
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
                    title="Well-qualified doctors" 
                    description="Experienced professionals ready to care for you"
                    Icon={Users}
                    className="top-10 -left-6 md:-left-20 rotate-[-4deg]"
                />

                <FloatingCard
                    title="Book an appointment" 
                    description="Seamlessly schedule your visits"
                    Icon={Clock}
                    className="
                        top-48 md:top-40 left-32 md:left-60 z-10 
                        w-[280px] rotate-[4deg]
                    "
                />
                <FloatingCard
                    title="Digital healthcare platform" 
                    description="Your complete care hub"
                    Icon={Clock}
                    className="
                        bottom-0 md:bottom-0 -left-6 md:-left-16 z-10 
                        rotate-[2deg] w-fit
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