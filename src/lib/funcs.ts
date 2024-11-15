import { phoneNumberRegex, emailRegex } from "@/app/index.types";

export const checkColumnType = (column: string): 'email' | 'phoneNumber' | 'unknown' => {
    if (emailRegex.test(column)) {
        return 'email';
    } else if (phoneNumberRegex.test(column)) {
        return 'phoneNumber';
    } else {
        return 'unknown';
    }
};
