import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Left() {
    return (
        <div className="grid col-span-1">
            <div className="flex flex-col gap-10 items-center md:items-start">
                <div className="flex flex-col gap-5 text-center md:text-start ">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-5xl font-bold text-primary">We care</h1>
                        <p className="text-4xl font-bold">about your health</p>
                    </div>
                    <br />
                </div>
                    <Button asChild className="flex items-center gap-2 text-2xl text-white rounded-lg hover:dark:text-background p-7 w-fit">
                        <Link href="/booking">
                            Book an appointment
                        </Link>
                    </Button>
            </div>
        </div>
    )
}