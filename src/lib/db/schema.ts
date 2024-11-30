import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const registeredWithEnum = pgEnum('registeredWith', ['email', 'phoneNumber'])
export const roleEnum = pgEnum('role', ['user', 'admin', 'doctor', 'receptionist'])

// User

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	username: text('username').unique(),
	email: text('email').unique(),
	phoneNumber: text('phoneNumber').unique(),
	nationalId: text('nationalId').unique(),
	phoneNumberVerified: boolean('phoneNumberVerified').default(false).notNull(),
	emailVerified: boolean('emailVerified').default(false).notNull(),
	onBoarding: boolean('onBoarding').default(true).notNull(),
	image: text('image').default('pfp.jpg').notNull(),
	role: roleEnum('role').default('user').notNull(),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull()
});

const userRelation = relations(user, ({ one, many }) => ({
	doctor: one(doctor, {
		fields: [user.id],
		references: [doctor.userId]
	}),
	schedules: many(schedule),
	appointments: many(appointment),
}))

// Doctor

export const doctor = pgTable('doctor', {
	id: text('id').primaryKey(),
	specialty: text('specialty'),
	userId: text('userId').references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
})

const doctorRelation = relations(doctor, ({ one, many }) => ({
	user: one(user, {
		fields: [doctor.userId],
		references: [user.id]
	}),
	appointments: many(appointment),
}))

// Schedule

export const dayEnum = pgEnum('day', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])

export const schedule = pgTable('schedule', {
	id: text('id').primaryKey(),
	day: dayEnum('day').notNull(),
	startTime: timestamp('startTime').notNull(), // first work hour for a certain day
	endTime: timestamp('endTime').notNull(), // last work hour for a certain day
	userId: text('userId').references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
})

export const scheduleRelation = relations(schedule, ({ one }) => ({
	user: one(user, {
		fields: [schedule.userId],
		references: [user.id],
	}),
}))

// Receptionist

export const departmentEnum = pgEnum('department', [
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
]);

export const receptionist = pgTable('receptionist', {
	id: text('id').primaryKey(),
	userId: text('userId').references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
	department: departmentEnum('department').default('general').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

const receptionistRelation = relations(receptionist, ({ one, many }) => ({
	user: one(user, {
		fields: [receptionist.userId],
		references: [user.id]
	}),
	appointments: many(appointment),
}));

// Appointment table

export const appointmentStatusEnum = pgEnum('status', ['pending', 'ongoing', 'completed', 'cancelled'])
export const createdByEnum = pgEnum('createdBy', ['user', 'receptionist', 'doctor'])

export const appointment = pgTable('appointment', {
	id: text('id').primaryKey(),
	patientId: text('patientId').references(() => user.id, { onDelete: 'cascade' }).notNull(),
	doctorId: text('doctorId').references(() => doctor.id, { onDelete: 'cascade' }).notNull(),
	receptionistId: text('receptionistId').references(() => receptionist.id, { onDelete: 'cascade' }),
	startTime: timestamp('startTime').notNull(),
	endTime: timestamp('endTime').notNull(),
	status: appointmentStatusEnum('status').notNull().default('pending'),
	createdBy: createdByEnum('createdBy').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Medical Record table
export const medicalRecord = pgTable('medical_record', {
	id: text('id').primaryKey(),
	appointmentId: text('appointmentId').references(() => appointment.id, { onDelete: 'cascade' }).notNull(),
	diagnosis: text('diagnosis'),
	history: text('history'),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Relations
export const appointmentRelations = relations(appointment, ({ one }) => ({
	user: one(user, {
		fields: [appointment.patientId],
		references: [user.id],
	}),
	doctor: one(doctor, {
		fields: [appointment.doctorId],
		references: [doctor.id],
	}),
	receptionist: one(receptionist, {
		fields: [appointment.receptionistId],
		references: [receptionist.id],
	}),
	medicalRecord: one(medicalRecord, {
		fields: [appointment.id],
		references: [medicalRecord.appointmentId],
	}),
}));

export const medicalRecordRelations = relations(medicalRecord, ({ one }) => ({
	appointment: one(appointment, {
		fields: [medicalRecord.appointmentId],
		references: [appointment.id],
	}),
}));

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
	refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt'),
	updatedAt: timestamp('updatedAt')
});


// Relations

// Types

export type Appointment = InferSelectModel<typeof appointment>;
export type User = InferSelectModel<typeof user>;
export type Doctor = InferSelectModel<typeof doctor>;
export type Schedule = InferSelectModel<typeof schedule>;
export type Receptionist = InferSelectModel<typeof receptionist>;
export type Tables = 'user' | 'doctor' | 'receptionist' | 'schedule' | 'session' | 'account' | 'appointment';