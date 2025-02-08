'use server'

import { operationDataSchema } from "@/app/(authenticated)/dashboard/operations/types"
import db from "@/lib/db"
import { Doctor, Operation, operation, OperationData, operationData, Schedule, User } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createOperation({
    doctorId,
    patientId,
    createdBy,
    date,
    status,
    receptionistId,
}: {
    doctorId: Doctor['id'],
    patientId: User['id'],
    createdBy: Operation['createdBy'],
    status: Operation['status']
    date: Date;
    receptionistId?: string
}) {

    const createdOperation = await db.insert(operation).values({
        id: generateId(),
        patientId: patientId,
        doctorId: doctorId,
        receptionistId: receptionistId ? receptionistId : null,
        startTime: date,
        status: status,
        type: 'surgical',
        createdBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning()


    if (createdOperation) {
        revalidatePath('/dashboard/operations')
        return {
            success: true,
            message: 'Operation Created Successfuly',
            operationId: createdOperation[0].id,
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


export async function createOperationData({ data, operationId }: { data: z.infer<typeof operationDataSchema>, operationId: Operation['id'] }) {

    const operationDataId = generateId();

    const [createdOperationData] = await db.insert(operationData).values({
        id: operationDataId,
        one: data.one,
        two: data.two,
        three: data.three,
        operationId: operationId,
    }).returning()

    if(!createdOperationData.id) return {
        error: "Failed to create operation data entry!!"
    }

    return {
        data: createdOperationData as OperationData,
        message: "Operation data inserted!",
        error: null
    }
}


export async function updateOperationData({ data, operationDataId }: { data: Partial<z.infer<typeof operationDataSchema>>, operationDataId: OperationData['id'] }) {
    const [updatedOperationData] = await db
        .update(operationData)
        .set({
            ...data
        })
        .where(eq(operationData.id, operationDataId))
        .returning();

    if (!updatedOperationData) {
        return {
            error: "Failed to update operation data entry!"
        };
    }

    return {
        data: updatedOperationData as OperationData,
        message: "Operation data updated successfully!",
        error: null
    };
}