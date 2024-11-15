import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";


export const registeredWithEnum = pgEnum('registeredWith', ['email', 'phoneNumber'])

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	username: text('username').unique(),
	email: text('email').notNull().unique(),
	phoneNumber: text('phoneNumber').unique(),
	bio: text('bio'),
	phoneNumberVerified: boolean('phoneNumberVerified').default(false).notNull(),
	emailVerified: boolean('emailVerified').default(false).notNull(),
	onBoarding: boolean('onBoarding').default(true).notNull(),
	registeredWith: registeredWithEnum('registeredWith').notNull(),
	image: text('image').default('pfp.jpg').notNull(),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	expiresAt: timestamp('expiresAt'),
	password: text('password')
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull()
});

// Relations

// Types

export type TUser = InferSelectModel<typeof user>;