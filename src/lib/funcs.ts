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

export function normalizeData(value: string): string;
export function normalizeData(value: Record<string, any>, type: "object"): Record<string, any>;
export function normalizeData(
    value: string | Record<string, any>,
    type: "string" | "object" = "string"
): string | Record<string, any> {
    if (type === "string") {
        return (value as string).trim().toLowerCase().replace(/\s/g, "") || "";
    }

    if (type === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, any>).map(([key, val]) => [
                key,
                typeof val === "string" ? normalizeData(val) : val,
            ])
        );
    }

    return "";
}

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
    const groupedSchedules: Record<string, { startTime: string; endTime: string }[]> = {};

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
            startTime: startTime,
            endTime: endTime,
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

export const getFileUrl = (name: string) => {
    if (name == 'pfp.jpg') {
        return `/images/${name}`
    }
    if (name?.includes('https') || name?.includes('http')) {
        return name
    } else {
        return `${process.env.NEXT_PUBLIC_S3_DEV_URL}` + name
    }
}

export function getDateByDayName(day: string) {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const targetDayIndex = daysOfWeek.indexOf(day.toLowerCase());

    if (targetDayIndex === -1) {
        throw new Error("Invalid day name");
    }

    // Calculate the difference in days
    let daysToAdd = targetDayIndex - currentDayIndex;
    if (daysToAdd < 0) {
        daysToAdd += 7; // Move to next week if the day has passed
    }

    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysToAdd);

    return targetDate; // Format as a readable date string
}

export const parseTimeStringToDate = (timeString: string): Date => {
    const [hours, minutes] = timeString?.split(":").map(Number) ?? [0, 0];
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
};

// Helper function to convert a readable stream to a Buffer
export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}