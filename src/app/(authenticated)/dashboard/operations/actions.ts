'use server'

import { operationDataSchema } from "@/app/(authenticated)/dashboard/operations/types"
import db from "@/lib/db"
import { Doctor, Operation, operation, OperationData, operationData, Schedule, User } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import mammoth from 'mammoth';
import fs from "fs/promises";

export async function createOperation({
    doctorId,
    patientId,
    createdBy,
    date,
    status,
    creatorId,
}: {
    doctorId: Doctor['id'],
    patientId: User['id'],
    createdBy: Operation['createdBy'],
    status: Operation['status']
    date: Date;
    creatorId: User['id']
}) {

    const createdOperation = await db.insert(operation).values({
        id: generateId(),
        patientId: patientId,
        doctorId: doctorId,
        creatorId: creatorId,
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


export async function createOperationData({ data, operationId }: { data: any, operationId: Operation['id'] }) {

    const operationDataId = generateId();

    const [createdOperationData] = await db.insert(operationData).values({
        id: operationDataId,
        data,
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

export async function extractPlaceholders(filePath: string): Promise<string[]> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value; // Extract the raw text
  
      // Use regex to find all placeholders (words inside {})
      const placeholderRegex = /\{([^}]+)\}/g;
      const matches = text.match(placeholderRegex);
  
      if (!matches) {
        return []; // No placeholders found
      }
  
      // Extract the placeholder names (remove the {})
      const placeholders = matches.map((match) => match.slice(1, -1));
  
      // Return unique placeholders
      return [...new Set(placeholders)];
    } catch (error) {
      console.error('Error reading the .docx file:', error);
      throw error;
    }
  }