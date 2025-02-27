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
  "cardiology",
  "dermatology",
  "gastroenterology",
  "neurology",
  "orthopedics",
  "pediatrics",
  "psychiatry",
  "radiology",
  "urology",
] as const;

export const days = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export const departments = [
  "emergency",
  "cardiology",
  "neurology",
  "pediatrics",
  "oncology",
  "orthopedics",
  "radiology",
  "surgery",
  "obstetrics",
  "psychiatry",
  "general",
] as const;

export const laboratories = [
  { value: "quest_diagnostics", label: "Quest Diagnostics" },
  { value: "labcorp", label: "Labcorp" },
  { value: "bio_reference_laboratories", label: "Bio Reference Laboratories" },
  { value: "sonora_quest_laboratories", label: "Sonora Quest Laboratories" },
  { value: "acutis_diagnostics", label: "Acutis Diagnostics" },
];

export const radiologies = [
  { value: "radiology_partners", label: "Radiology Partners" },
  { value: "advanced_imaging_centers", label: "Advanced Imaging Centers" },
  {
    value: "american_radiology_services",
    label: "American Radiology Services",
  },
  { value: "premier_radiology", label: "Premier Radiology" },
  { value: "touchstone_imaging", label: "Touchstone Imaging" },
];

export const medicines = [
  { value: "paracetamol", label: "Paracetamol" },
  { value: "ibuprofen", label: "Ibuprofen" },
  { value: "amoxicillin", label: "Amoxicillin" },
  { value: "metformin", label: "Metformin" },
  { value: "atorvastatin", label: "Atorvastatin" },
];
