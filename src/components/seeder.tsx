'use client'

import LoadingBtn from "@/components/loading-btn";
import { Button } from "@/components/ui/button";
import { reset, seed } from "@/lib/db/seed";

import { Bean, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Seeder() {
    const [isSeedLoading, setIsSeedLoading] = useState<boolean>(false);
    const [isResetLoading, setIsResetLoading] = useState<boolean>(false);

    const clearStorageAndCookies = () => {
        // Clear localStorage & sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Remove all cookies
        document.cookie.split(";").forEach((cookie) => {
            const [name] = cookie.split("=");
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });

        toast.success("Cleared all cookies and storage.");
    };

    const seeder = async () => {
        if (isResetLoading) {
            toast.error("Reset in progress");
            return;
        }

        setIsSeedLoading(true);
        const { message, error } = await seed();

        if (message) {
            toast(message);
            setIsSeedLoading(false);
        }

        if (error) {
            toast.error(error as string);
            setIsSeedLoading(false);
        }
    };

    const reseter = async () => {
        if (isSeedLoading) {
            toast.error("Seed in progress");
            return;
        }

        setIsResetLoading(true);

        // Clear storage and cookies before resetting the database
        clearStorageAndCookies();

        const { message, error } = await reset();

        if (message) {
            toast(message);
            setIsResetLoading(false);
        }

        if (error) {
            toast.error(error as string);
            setIsResetLoading(false);
        }
    };

    return (
        <div className="flex justify-end w-full">
            <div className="flex flex-col gap-3 justify-end w-[400px] border-x-2 border-b-2 border-zinc-800 p-4">
                <div className="flex flex-col gap-1">
                    <span>Seed:</span>
                    <LoadingBtn isLoading={isSeedLoading} onClick={async () => await seeder()}>
                        <Bean />
                        Seed
                    </LoadingBtn>
                </div>
                <div className="flex flex-col gap-1">
                    <span>Reset:</span>
                    <LoadingBtn isLoading={isResetLoading} variant={"destructive"} onClick={async () => await reseter()}>
                        <Trash2 />
                        Reset
                    </LoadingBtn>
                </div>
            </div>
        </div>
    );
}