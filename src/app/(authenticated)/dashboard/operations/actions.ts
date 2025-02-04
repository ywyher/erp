'use server'

import db from "@/lib/db"
import { Doctor, Operation, operation, Schedule, User } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

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