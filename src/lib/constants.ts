export const genders = [
    "male",
    'female'
] as const;

export const socialStatuses = [
    "draft", // Service is created but not yet published
    "published", // Service is live and available to users
    "inactive", // Temporarily disabled (meaning that it had been published before)
    "archived", // Old or discontinued service, kept for records
] as const