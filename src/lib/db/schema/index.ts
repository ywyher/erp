import { InferSelectModel } from "drizzle-orm";
import { appointment } from "./appointment";
import { doctor, receptionist, user } from "./roles";
import { schedule } from "./schedule";
import { medicalFile } from "./medical-file";
import { consultation } from "./consultation";
import { prescription } from "./prescription";
import { operation, operationData } from "./operation";
import { settings } from "./settings";
import { service } from "./service";
import { preset } from "./preset";
import { post } from "./post";
import { faq } from "./faq";
import { account, session } from "@/lib/db/schema/auth";
export * from "./enums";
export * from "./roles";
export * from "./auth";
export * from "./appointment";
export * from "./medical-file";
export * from "./schedule";
export * from "./consultation";
export * from "./prescription";
export * from "./operation";
export * from "./settings";
export * from "./service";
export * from "./post";
export * from "./preset";
export * from "./faq";

export type Faq = InferSelectModel<typeof faq>;
export type Preset = InferSelectModel<typeof preset>;
export type Post = InferSelectModel<typeof post>;
export type Service = InferSelectModel<typeof service>;
export type Settings = InferSelectModel<typeof settings>;
export type OperationData = InferSelectModel<typeof operationData>;
export type Operation = InferSelectModel<typeof operation>;
export type Appointment = InferSelectModel<typeof appointment>;
export type User = InferSelectModel<typeof user>;
export type Doctor = InferSelectModel<typeof doctor>;
export type Schedule = InferSelectModel<typeof schedule>;
export type Receptionist = InferSelectModel<typeof receptionist>;
export type MedicalFile = InferSelectModel<typeof medicalFile>;
export type Consultation = InferSelectModel<typeof consultation>;
export type Prescription = InferSelectModel<typeof prescription>;
export type Account = InferSelectModel<typeof account>;
export type Session = InferSelectModel<typeof session>;
export type Tables =
  | "user"
  | "doctor"
  | "receptionist"
  | "schedule"
  | "session"
  | "account"
  | "appointment"
  | "operation"
  | "service"
  | "post"
  | "preset"
  | "faq"