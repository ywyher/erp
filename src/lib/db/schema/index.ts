import { InferSelectModel } from 'drizzle-orm'
import { appointment } from './appointment'
import { doctor, receptionist, user } from './roles'
import { schedule } from './schedule'
import { medicalFile } from './medical-file'
import { consultation } from './consultation'
import { prescription } from './prescription'
import { operation, operationData } from '@/lib/db/schema/operation'
export * from './enums'
export * from './roles'
export * from './auth'
export * from './appointment'
export * from './medical-file'
export * from './schedule'
export * from './consultation'
export * from './prescription'
export * from './operation'

export type OperationData = InferSelectModel<typeof operationData>;
export type Operation = InferSelectModel<typeof operation>;
export type Appointment = InferSelectModel<typeof appointment>;
export type User = InferSelectModel<typeof user>;
export type Doctor = InferSelectModel<typeof doctor>;
export type Schedule = InferSelectModel<typeof schedule>;
export type Recseptionist = InferSelectModel<typeof receptionist>;
export type MedicalFile = InferSelectModel<typeof medicalFile>;
export type Consultation = InferSelectModel<typeof consultation>;
export type Prescription = InferSelectModel<typeof prescription>;
export type Tables = 'user' | 'doctor' | 'receptionist' | 'schedule' | 'session' | 'account' | 'appointment' | 'operation';