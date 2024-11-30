// export const specialties = [
//     { value: 'cardiology', label: 'CARDIOLOGY' },
//     { value: 'dermatology', label: 'DERMATOLOGY' },
//     { value: 'gastroenterology', label: 'GASTROENTEROLOGY' },
//     { value: 'neurology', label: 'NEUROLOGY' },
//     { value: 'orthopedics', label: 'ORTHOPEDICS' },
//     { value: 'pediatrics', label: 'PEDIATRICS' },
//     { value: 'psychiatry', label: 'PSYCHIATRY' },
//     { value: 'radiology', label: 'RADIOLOGY' },
//     { value: 'urology', label: 'UROLOGY' },
// ]

export const specialties = [
    'cardiology',
    'dermatology',
    'gastroenterology',
    'neurology',
    'orthopedics',
    'pediatrics',
    'psychiatry',
    'radiology',
    'urology'
] as const

export const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
]

export const departments = [
    'emergency',
    'cardiology',
    'neurology',
    'pediatrics',
    'oncology',
    'orthopedics',
    'radiology',
    'surgery',
    'obstetrics',
    'psychiatry',
    'general'
] as const