'use client'

import ScheduleSelector from "@/app/(authenticated)/dashboard/_components/schedule-selector";
import { updateSchedule } from "@/app/(authenticated)/dashboard/actions";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { Schedule } from "@/app/types";
import LoadingBtn from "@/components/loading-btn";
import { User } from "@/lib/auth-client";
import { getUserById } from "@/lib/db/queries";
import { groupSchedules, transformSchedulesToRecords } from "@/lib/funcs";
import { getErrorMessage } from "@/lib/handle-error";
import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

export default function UpdateSchedule({ userId, setOpen }: { userId: string, setOpen?: Dispatch<SetStateAction<boolean>> }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [schedules, setSchedules] = useState<Schedules>({});
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    const { data: user, isLoading: isPending } = useQuery({
        queryKey: ['userById', userId],
        queryFn: async () => {
            const data = await getUserById(userId, 'doctor');
            return data as { user: User, schedules: Schedule[] };
        }
    })

    useEffect(() => {
        if (user) {
            const groupedSchedules = groupSchedules(user.schedules);
            const selectedDays = Object.keys(groupedSchedules);

            setSchedules(groupedSchedules);
            setSelectedDays(selectedDays);
        }
    }, [user])

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            if (!user) {
                throw new Error("User data not available");
            }

            if (selectedDays.length == 0) {
                getErrorMessage('Schedule is required')
                return;
            }

            const missingSchedules = selectedDays.filter((day) => !schedules[day] || schedules[day].length === 0);

            if (missingSchedules.length > 0) {
                getErrorMessage(`The following days are missing schedules: ${missingSchedules.join(", ")}`)
                return;
            }

            const sessionSchedules = user.schedules;
            const newSchedules = transformSchedulesToRecords(schedules, userId);

            const areSchedulesEqual = compareSchedules(sessionSchedules, newSchedules);

            if (areSchedulesEqual) {
                getErrorMessage("The schedules are the same as the current ones. No updates needed.")
                return;
            }

            const result = await updateSchedule({ schedules, userId })

            if (result.success) {
                toast(result.message);

                if (setOpen) setOpen(false)
            }
        } catch (error) {
            console.error("Error updating schedule:", error);
            getErrorMessage("An error occurred while updating the schedule.")
        } finally {
            setIsLoading(false);
        }
    }

    // Helper function to compare schedules
    const compareSchedules = (schedules1: Schedule[], schedules2: Schedule[]): boolean => {
        if (schedules1.length !== schedules2.length) return false;

        const sortedSchedules1 = [...schedules1].sort((a, b) => a.startTime.localeCompare(b.startTime));
        const sortedSchedules2 = [...schedules2].sort((a, b) => a.startTime.localeCompare(b.startTime));

        for (let i = 0; i < sortedSchedules1.length; i++) {
            const s1 = sortedSchedules1[i];
            const s2 = sortedSchedules2[i];

            if (s1.day !== s2.day || s1.startTime !== s2.startTime || s1.endTime !== s2.endTime) {
                return false;
            }
        }

        return true;
    }

    return (
        <div className="flex flex-col gap-2">
            <ScheduleSelector
                schedules={schedules}
                setSchedules={setSchedules}
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
            />
            <div className="mt-4">
                <LoadingBtn isLoading={isLoading} label="Submit" onClick={onSubmit} />
            </div>
        </div>
    )
}