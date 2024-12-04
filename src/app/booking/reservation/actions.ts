'use server'

import { UploadedFile } from "@/hooks/use-upload-file"
import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { appointment, Appointment, doctor, medicalFile, user } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export const getAppointment = async (appointmentId: Appointment['id']) => {
    const [appointmentData] = await db.select({
        appointment: appointment,
        doctor: {
            ...doctor,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                nationalId: user.nationalId,
                phoneNumberVerified: user.phoneNumberVerified,
                emailVerified: user.emailVerified,
                onBoarding: user.onBoarding,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        },
    }).from(appointment)
        .leftJoin(doctor, eq(doctor.id, appointment.doctorId))
        .leftJoin(user, eq(user.id, doctor.userId))
        .where(eq(appointment.id, appointmentId))

    return appointmentData;
}

export const saveMedicalFilesInDb = async ({
    appointmentId,
    files
}: {
    appointmentId: Appointment['id'],
    files: UploadedFile[]
}) => {
    console.log(files)
    const { data } = await getSession({
        fetchOptions: {
            headers: await headers()
        }
    });

    if (!data) {
        throw new Error('User not found');
    }

    const patient = data.user;
    const savedFiles = [];

    for (const file of files) {
        if (!file.name || !file.type) {
            return {
                error: 'Invalid file',
            }
        }
        try {
            const savedFile = await db.insert(medicalFile).values({
                id: generateId(),
                name: file.name,
                type: file.type,
                patientId: patient.id,
                appointmentId: appointmentId
            });
            savedFiles.push(savedFile);
        } catch (error) {
            return {
                error: error
            }
        }
    }

    return {
        success: true,
        message: 'Files uploaded successfully',
        savedFiles
    };
};