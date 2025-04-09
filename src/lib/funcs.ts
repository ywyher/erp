import { Schedules } from "@/app/(authenticated)/dashboard/types";
import { phoneNumberRegex, emailRegex, usernameRegex } from "@/app/types";
import { Schedule, User } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export const checkIdentifier = (
  column: string,
): "email" | "phoneNumber" | "username" | "unknown" => {
  if (emailRegex.test(column)) {
    return "email";
  } else if (phoneNumberRegex.test(column)) {
    return "phoneNumber";
  } else if (usernameRegex.test(column)) {
    return "username";
  } else {
    return "unknown";
  }
};

export function normalizeData(value: string): string;
export function normalizeData(
  value: Record<string, unknown>,
  type: "object",
): Record<string, unknown>;
export function normalizeData(
  value: string | Record<string, unknown>,
  type: "string" | "object" = "string",
): string | Record<string, unknown> {
  if (type === "string") {
    return (value as string).trim().toLowerCase().replace(/\s/g, "") || "";
  }

  if (type === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        typeof val === "string"
          ? key === "name"
            ? val.toLowerCase() // **Lowercase, but DON'T trim the name**
            : normalizeData(val) // **Trim & lowercase for other fields**
          : val,
      ]),
    );
  }

  return "";
}

export const generateFakeField = (
  field: "username" | "name" | "email",
  phoneNumber?: string,
) => {
  const randomNumbers = Math.floor(100000 + Math.random() * 900000);
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "app";

  if (field === "username") {
    return `user${randomNumbers}`;
  }

  if (field === "name") {
    return `user${randomNumbers}`;
  }

  if (field === "email") {
    if (!phoneNumber) {
      throw new Error(
        "If using a fake email, you must provide a phone number as the phoneNumber.",
      );
    }
    return `${phoneNumber}@${appName}.fake`;
  }
};

export const isFakeEmail = (email: string | undefined | null): boolean => {
  return email?.toLowerCase().endsWith(".fake") || false;
};

export const generateId = (size?: number) => {
  return nanoid(size);
};

export const groupSchedules = (schedules: Schedule[]) => {
  const groupedSchedules: Record<
    string,
    { startTime: string; endTime: string }[]
  > = {};

  schedules.forEach((item) => {
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

export const transformArrToObj = (arr: string[]) => {
  const transformedArr = arr.map((item) => ({
    value: item as string,
    label: (item.charAt(0).toUpperCase() + item.slice(1)) as string,
  }));

  return transformedArr;
};

export const transformSchedulesToRecords = (
  schedules: Schedules,
  userId: string,
) => {
  const scheduleRecords = Object.entries(schedules).flatMap(
    ([day, timeRanges]) =>
      timeRanges.map(({ startTime, endTime }) => ({
        id: generateId(),
        day: day as
          | "sunday"
          | "monday"
          | "tuesday"
          | "wednesday"
          | "thursday"
          | "friday"
          | "saturday",
        startTime: startTime,
        endTime: endTime,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
  );

  return scheduleRecords;
};

export function excludeField<T extends object, K extends keyof T>(
  obj: T,
  field: K,
): Omit<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [field]: _, ...rest } = obj;

  return rest;
}

export function groupSchedulesByDay(
  schedules: Schedule[],
): Record<string, Schedule[]> {
  return schedules.reduce(
    (acc, schedule) => {
      const day = schedule.day.toLowerCase();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(schedule);
      return acc;
    },
    {} as Record<string, Schedule[]>,
  );
}

export const getFileUrl = (name: string) => {
  if (name == "pfp.jpg") {
    return `/images/${name}`;
  }
  if (name?.includes("https") || name?.includes("http")) {
    return name;
  } else {
    return `${process.env.NEXT_PUBLIC_S3_DEV_URL}` + name;
  }
};

export function getDateByDayName(day: string) {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
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

export function checkVerificationNeeded(user: User): {
  type: "email" | "phoneNumber";
  value: string;
} | null {
  if (!user) return null;

  if (
    user.email &&
    !user.emailVerified &&
    !user.phoneNumberVerified &&
    !isFakeEmail(user.email)
  ) {
    return { type: "email", value: user.email };
  }

  if (user.phoneNumber && !user.phoneNumberVerified && !user.emailVerified) {
    return { type: "phoneNumber", value: user.phoneNumber };
  }

  return null; // Instead of returning { type: null, value: null }
}

export function getChangedFields<T extends Record<string, unknown>>(
  originalData: T,
  newData: T,
  normalize: boolean = true,
): Partial<T> {
  const normalizedOriginal = normalize
    ? Object.fromEntries(
        Object.entries(originalData).map(([key, val]) => [
          key,
          typeof val === "string" ? normalizeData(val) : val,
        ]),
      )
    : originalData;

  const normalizedNew = normalize
    ? Object.fromEntries(
        Object.entries(newData).map(([key, val]) => [
          key,
          typeof val === "string" ? normalizeData(val) : val,
        ]),
      )
    : newData;

  return Object.fromEntries(
    Object.entries(normalizedNew).filter(([key, newValue]) => {
      // Special handling for Date objects
      if (
        normalizedOriginal[key] instanceof Date && 
        newValue instanceof Date
      ) {
        return normalizedOriginal[key].getTime() !== newValue.getTime();
      }
      // Regular comparison for other types
      return newValue !== normalizedOriginal[key];
    }),
  ) as Partial<T>;
}

export function getDaysInRange(start: Date, end: Date): string[] {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const result = [];
  const current = new Date(start);

  while (current <= end) {
    result.push(days[current.getDay()]);
    current.setDate(current.getDate() + 1);
  }

  return [...new Set(result)]; // Remove duplicates
}

export const generateRandomDefaultValues = () => {
  const generateEgyptianNationalId = () => {
    const century = "2"; // Assuming 21st century, change to "1" for 20th century
    const year = String(Math.floor(Math.random() * 100)).padStart(2, "0"); // Last 2 digits of birth year
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0"); // 01-12
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0"); // 01-28 (safe range)
    const govCode = String(Math.floor(Math.random() * 30) + 1).padStart(2, "0"); // Random governorate code
    const randomDigits = String(Math.floor(Math.random() * 1000)).padStart(3, "0"); // Serial number
    const genderDigit = Math.random() < 0.5 ? "1" : "2"; // 1 for male, 2 for female
    const checkDigit = Math.floor(Math.random() * 10); // Random check digit

    return `${century}${year}${month}${day}${govCode}${randomDigits}${genderDigit}${checkDigit}`;
  };

  const generateEgyptianPhoneNumber = () => {
    const prefixes = ["010", "011", "012", "015"]; // Common Egyptian mobile prefixes
    const number = String(Math.floor(Math.random() * 1e7)).padStart(7, "0"); // 7-digit random number
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${number}`;
  };

  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateRandomName = () => {
    const firstNames = ["Ahmed", "Mohamed", "Omar", "Kareem", "Youssef", "Ali", "Hassan"];
    const lastNames = ["El-Sayed", "Ibrahim", "Mahmoud", "Fathy", "Taha", "Gamal", "Mostafa"];
    return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
  };

  const generateRandomUsername = (name: string) => {
    return name.toLowerCase().replace(/\s/g, "") + Math.floor(Math.random() * 1000);
  };

  const generateRandomEmail = (username: string) => {
    const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
    return `${username}@${getRandomElement(domains)}`;
  };

  const generateRandomDateOfBirth = () => {
    const year = Math.floor(Math.random() * (2005 - 1970) + 1970); // Random year between 1970 and 2005
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0"); // Avoiding 29-31 for simplicity
    return `${year}-${month}-${day}`;
  };

  const genders = ["male", "female"];

  const name = generateRandomName();
  const username = generateRandomUsername(name);
  const email = generateRandomEmail(username);
  const gender = getRandomElement(genders);
  const dateOfBirth = generateRandomDateOfBirth();
  const phoneNumber = generateEgyptianPhoneNumber();
  const nationalId = generateEgyptianNationalId();

  return {
    name,
    username,
    email,
    gender,
    dateOfBirth,
    phoneNumber,
    nationalId,
  };
};