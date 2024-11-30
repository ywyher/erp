import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { phoneNumberRegex, emailRegex } from "@/app/types";
import { Schedule } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export const checkFieldType = (column: string): 'email' | 'phoneNumber' | 'unknown' => {
    if (emailRegex.test(column)) {
        return 'email';
    } else if (phoneNumberRegex.test(column)) {
        return 'phoneNumber';
    } else {
        return 'unknown';
    }
};

export const normalizeData = (value: string | undefined | null): string => {
    return value?.trim().toLowerCase().replace(/\s/g, "") || '';
};

export const generateFakeField = (
    field: 'username' | 'name' | 'email',
    phoneNumber?: string
) => {
    const randomNumbers = Math.floor(100000 + Math.random() * 900000);
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "app";

    if (field === 'username') {
        return `user${randomNumbers}`;
    }

    if (field === 'name') {
        return `user${randomNumbers}`;
    }

    if (field === 'email') {
        if (!phoneNumber) {
            throw new Error(
                "If using a fake email, you must provide a phone number as the phoneNumber."
            );
        }
        return `${phoneNumber}@${appName}.fake`;
    }
};


export const isFakeEmail = (email: string | undefined | null): boolean => {
    return email?.toLowerCase().endsWith('.fake') || false;
};

export const generateId = (size?: number) => {
    return nanoid(size);
};

export const groupSchedules = (schedules: Schedule[]) => {
    console.log(schedules)
    const groupedSchedules: Record<string, { startTime: Date; endTime: Date }[]> = {};

    schedules.forEach(item => {
        const { day, startTime, endTime } = item;

        // Initialize the array for the day if not present
        if (!groupedSchedules[day]) {
            groupedSchedules[day] = [];
        }

        // Push the schedule object for the corresponding day
        groupedSchedules[day].push({ startTime, endTime });
    });

    return groupedSchedules;
};

export const transformArrToObj = (arr: any[]) => {
    const transformedArr = arr.map(item => ({
        value: item as string,
        label: item.charAt(0).toUpperCase() + item.slice(1) as string
    }));

    return transformedArr;
}

export const transformSchedulesToRecords = (schedules: Schedules, userId: string) => {
    const scheduleRecords = Object.entries(schedules).flatMap(([day, timeRanges]) =>
        timeRanges.map(({ startTime, endTime }) => ({
            id: generateId(),
            day: day as "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        }))
    );

    return scheduleRecords;
}

export function excludeField<T extends object, K extends keyof T>(obj: T, field: K): Omit<T, K> {
    const { [field]: _, ...rest } = obj;
    return rest;
}

export function groupSchedulesByDay(schedules: Schedule[]): Record<string, Schedule[]> {
    return schedules.reduce((acc, schedule) => {
        const day = schedule.day.toLowerCase();
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(schedule);
        return acc;
    }, {} as Record<string, Schedule[]>);
}