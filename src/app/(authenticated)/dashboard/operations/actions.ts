'use server'

import db from "@/lib/db"
import { Appointment, Doctor, Operation, operation, OperationData, operationData, Schedule, User } from "@/lib/db/schema"
import { generateId, streamToBuffer } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import mammoth from 'mammoth';
import fs from "fs/promises";
import { redirect } from "next/navigation"
import { getOperationDocument } from "@/lib/db/queries"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "@/lib/utils"

export async function createOperation({
    doctorId,
    patientId,
    createdBy,
    date,
    status,
    creatorId,
    appointmentId
}: {
    doctorId: Doctor['id'],
    patientId: User['id'],
    createdBy: Operation['createdBy'],
    status: Operation['status']
    date: Date;
    creatorId: User['id']
    appointmentId?: Appointment['id']
}) {

    const [createdOperation] = await db.insert(operation).values({
        id: generateId(),
        patientId: patientId,
        doctorId: doctorId,
        creatorId: creatorId,
        appointmentId: appointmentId ? appointmentId : null,
        startTime: date,
        status: status,
        type: 'surgical',
        createdBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning({ id: operation.id })

    if(!createdOperation.id) return {
        error: "Couldn't create operation!"
    }


    if (createdOperation) {
        revalidatePath('/dashboard/operations')
        return {
            error: null,
            message: 'Operation Created Successfuly',
            operationId: createdOperation.id,
        }
    }
}

export async function updateOperationStatus({ operationId, status }: { operationId: Operation['id'], status: Operation['status'] }) {
    const [updatedOperation] = await db.update(operation).set({
        status: status
    })
        .where(eq(operation.id, operationId))
        .returning({ id: operation.id })

    if(!updatedOperation.id) return {
        error: "Failed to update operation status!"
    } 

    return {
        message: `Operation Status Updated To ${status}`,
        error: null
    }
}

export async function updateOperationEndTime({ operationId, date }: { operationId: Operation['id'] ,date: Date }) {
    const [updatedOperation] = await db.update(operation).set({
        endTime: date
    }).returning()

    if(!updatedOperation.id) return {
        error: "Couldn't update the end time!"
    }

    return {
        operationId: updatedOperation.id,
        message: 'End time updated!!',
        error: null,
    }
}


export async function createOperationData({ data, operationId }: { data: any, operationId: Operation['id'] }) {

    const operationDataId = generateId();

    const operationDocument = await getOperationDocument()

    const [createdOperationData] = await db.insert(operationData).values({
        id: operationDataId,
        data,
        documentName: operationDocument,
        operationId: operationId,
    }).returning()

    if(!createdOperationData.id) return {
        error: "Failed to create operation data entry!!"
    }

    const updatedOperationData = await updateOperationStatus({ operationId: operationId, status: 'completed' })

    if(updatedOperationData.error) return {
        error: updatedOperationData.error
    }

    const updatedOperationEndTime = await updateOperationEndTime({ operationId, date: new Date() })

    if(updatedOperationEndTime.error) return {
        error: updatedOperationEndTime.error
    }

    return {
        data: createdOperationData as OperationData,
        message: "Operation data inserted!",
        error: null
    }
}

export async function updateOperationData({ data, operationDataId }: { data: any, operationDataId: OperationData['id'] }) {
    const [updatedOperationData] = await db
        .update(operationData)
        .set({
            data
        })
        .where(eq(operationData.id, operationDataId))
        .returning();

    if (!updatedOperationData) {
        return {
            error: "Failed to update operation data entry!"
        };
    }

    revalidatePath(`/dashboard/operations/${updatedOperationData.operationId}`)
    return {
        data: updatedOperationData as OperationData,
        message: "Operation data updated successfully!",
        error: null
    };
}


export const getOperationStatus = async (operationId: Operation['id']) => {
    const [query] = await db.select().from(operation)
      .where(eq(operation.id, operationId))
  
    if(!query) {
        redirect('/dashboard/operations')
        return;
    }

    return query.status;
} 

export async function extractPlaceholders(fileKey: string): Promise<string[]> {
    try {
        const { S3_BUCKET_NAME } = process.env;

        if (!S3_BUCKET_NAME) {
            throw new Error('Missing required environment variables for S3 configuration');
        }

        // Fetch the file from R2 bucket
        const { Body } = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: fileKey }));

        // Read the file buffer from the stream
        if (!Body) throw new Error('Failed to retrieve file from R2');
        const fileBuffer = await streamToBuffer(Body as NodeJS.ReadableStream);

        // Extract raw text using Mammoth
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        const text = result.value;

        // Use regex to find all placeholders (words inside {})
        const placeholderRegex = /\{([^}]+)\}/g;
        const matches = text.match(placeholderRegex);

        if (!matches) return []; // No placeholders found

        return [...new Set(matches.map((match) => match.slice(1, -1)))];
    } catch (error) {
        console.error('Error processing the .docx file:', error);
        throw error;
    }
}