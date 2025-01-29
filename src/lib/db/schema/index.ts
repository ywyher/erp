import { InferSelectModel } from 'drizzle-orm'
import { appointment } from './appointment'
import { doctor, receptionist, user } from './roles'
import { schedule } from './schedule'
import { medicalFile } from './medical-file'
import { consultation } from './consultation'
export * from './roles'
export * from './auth'
export * from './appointment'
export * from './medical-file'
export * from './schedule'
export * from './consultation'

export type Appointment = InferSelectModel<typeof appointment>;
export type User = InferSelectModel<typeof user>;
export type Doctor = InferSelectModel<typeof doctor>;
export type Schedule = InferSelectModel<typeof schedule>;
export type Receptionist = InferSelectModel<typeof receptionist>;
export type MedicalFile = InferSelectModel<typeof medicalFile>;
export type Consultation = InferSelectModel<typeof consultation>;
export type Tables = 'user' | 'doctor' | 'receptionist' | 'schedule' | 'session' | 'account' | 'appointment';