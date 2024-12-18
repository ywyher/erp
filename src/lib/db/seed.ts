'use server'

import dotenv from 'dotenv';
dotenv.config();

import * as schema from './schema';
import db from './index';
import { generateId } from '../funcs';
import { sql } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';

export async function reset() {
    try {
        // Truncate all tables
        await db.execute(sql`
      TRUNCATE TABLE "verification", "account", "session", "medical_record", "medical_file", 
      "appointment", "schedule", "receptionist", "doctor", "user" CASCADE;
    `);

        console.log('Database reset successfully');
        return {
            message: 'Database reset successfully'
        }
    } catch (error) {
        console.error('Error resetting and seeding database:', error);
        return {
            error: error
        }
    }
}

export async function seed() {
    try {
        // Create a doctor user
        const doctorUser = await db.insert(schema.user).values({
            id: generateId(),
            name: 'doctor',
            username: 'doctor',
            email: 'doctor@gmail.com',
            phoneNumber: '01024824715',
            nationalId: '30801201100193',
            phoneNumberVerified: true,
            emailVerified: true,
            role: 'doctor',
            onBoarding: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Create a doctor
        const doctor = await db.insert(schema.doctor).values({
            id: generateId(),
            specialty: 'General Practice',
            userId: doctorUser[0].id,
        }).returning();

        // Create a schedule for the doctor
        await db.insert(schema.schedule).values({
            id: generateId(),
            day: 'monday',
            startTime: new Date('2023-01-01T09:00:00'),
            endTime: new Date('2023-01-01T17:00:00'),
            userId: doctorUser[0].id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create an admin user
        const adminUser = await db.insert(schema.user).values({
            id: generateId(),
            name: 'admin',
            username: 'admin',
            email: 'admin@gmail.com',
            phoneNumber: '01024824716',
            nationalId: '30801201100191',
            phoneNumberVerified: true,
            emailVerified: true,
            role: 'admin',
            onBoarding: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Create a receptionist user
        const receptionistUser = await db.insert(schema.user).values({
            id: generateId(),
            name: 'receptionist',
            username: 'receptionist',
            email: 'receptionist@gmail.com',
            phoneNumber: '01024824717',
            nationalId: '30801201100194',
            phoneNumberVerified: true,
            emailVerified: true,
            role: 'receptionist',
            onBoarding: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Create a receptionist
        const receptionist = await db.insert(schema.receptionist).values({
            id: generateId(),
            userId: receptionistUser[0].id,
            department: 'general',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Create a schedule for the doctor
        await db.insert(schema.schedule).values({
            id: generateId(),
            day: 'monday',
            startTime: new Date('2023-01-01T09:00:00'),
            endTime: new Date('2023-01-01T17:00:00'),
            userId: receptionistUser[0].id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create a normal user
        const normalUser = await db.insert(schema.user).values({
            id: generateId(),
            name: 'user',
            username: 'user',
            email: 'user@gmail.com',
            phoneNumber: '01558854716',
            nationalId: '30801201100192',
            phoneNumberVerified: true,
            emailVerified: true,
            role: 'user',
            onBoarding: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Create two appointments for the normal user
        for (let i = 0; i < 2; i++) {
            await db.insert(schema.appointment).values({
                id: generateId(),
                patientId: normalUser[0].id,
                doctorId: doctor[0].id,
                receptionistId: receptionist[0].id,
                startTime: new Date(`2023-06-${15 + i}T10:00:00`),
                endTime: new Date(`2023-06-${15 + i}T11:00:00`),
                status: 'pending',
                createdBy: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Create account entries for all users
        const users = [doctorUser[0], adminUser[0], receptionistUser[0], normalUser[0]];
        for (const user of users) {
            await db.insert(schema.account).values({
                id: generateId(),
                accountId: user.id,
                providerId: 'credential',
                userId: user.id,
                password: await hashPassword(user.role), // In a real scenario, ensure this is properly hashed
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        console.log('Seed data inserted successfully!');
        return {
            message: 'Seed data inserted successfully!'
        }
    } catch (error) {
        console.error('Error seeding data:', error);
        return {
            error: error
        }
    }
}