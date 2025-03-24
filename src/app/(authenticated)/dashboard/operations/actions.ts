"use server";

import db from "@/lib/db";
import {
  Appointment,
  doctor,
  Doctor,
  Operation,
  operation,
  OperationData,
  operationData,
  Schedule,
  user,
  User,
} from "@/lib/db/schema";
import { generateId } from "@/lib/funcs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import mammoth from "mammoth";
import fs from "fs/promises";
import { redirect } from "next/navigation";
import { getOperationDocument } from "@/lib/db/queries";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/utils";
import { format } from "date-fns";
import { presetSchema } from "@/app/(authenticated)/dashboard/operations/[operationId]/types";

export const getOperations = async (userId: User["id"], role: User["role"]) => {
  let operations;

  if (role == "admin") {
    operations = await db.select().from(operation);
  }

  if (role == "user") {
    operations = await db
      .select()
      .from(operation)
      .where(eq(operation.patientId, userId));
  }

  if (role == "doctor") {
    const [doctorData] = await db
      .select()
      .from(doctor)
      .where(eq(doctor.userId, userId));

    operations = await db
      .select()
      .from(operation)
      .where(eq(operation.doctorId, doctorData.id));
  }

  if (role == "receptionist") {
    const [receptionistData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    operations = await db
      .select()
      .from(operation)
      .where(eq(operation.creatorId, receptionistData.id));
  }

  if (!operations) throw new Error("Couldn't get appointmnets");

  return operations.map((operation) => ({
    id: operation.id,
    date: format(operation.startTime, "EEEE, d MMMM"),
    startTime: format(operation.startTime, "HH:mm"),
    endTime: operation.endTime ? format(operation.endTime, "HH:mm") : "None",
    status: operation.status,
    patientId: operation.patientId,
    doctorId: operation.doctorId,
    createdBy: operation.createdBy,
    type: operation.type,
    role: role,
  }));
};

export async function createOperation({
  doctorId,
  patientId,
  createdBy,
  date,
  status,
  creatorId,
  appointmentId,
}: {
  doctorId: Doctor["id"];
  patientId: User["id"];
  createdBy: Operation["createdBy"];
  status: Operation["status"];
  date: Date;
  creatorId: User["id"];
  appointmentId?: Appointment["id"];
}) {
  const [createdOperation] = await db
    .insert(operation)
    .values({
      id: generateId(),
      patientId: patientId,
      doctorId: doctorId,
      creatorId: creatorId,
      appointmentId: appointmentId ? appointmentId : null,
      startTime: date,
      status: status,
      type: "surgical",
      createdBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: operation.id });

  if (!createdOperation.id)
    return {
      error: "Couldn't create operation!",
    };

  if (createdOperation) {
    revalidatePath("/dashboard/operations");
    return {
      error: null,
      message: "Operation Created Successfuly",
      operationId: createdOperation.id,
    };
  }
}

export async function updateOperationStatus({
  operationId,
  status,
  dbInstance = db,
}: {
  operationId: Operation["id"];
  status: Operation["status"];
  dbInstance?: typeof db;
}) {
  const [updatedOperation] = await dbInstance
    .update(operation)
    .set({
      status: status,
    })
    .where(eq(operation.id, operationId))
    .returning({ id: operation.id });

  if (!updatedOperation.id)
    return {
      error: "Failed to update operation status!",
    };

  return {
    message: `Operation Status Updated To ${status}`,
    error: null,
  };
}

export async function updateOperationEndTime({
  operationId,
  date,
  dbInstance = db,
}: {
  operationId: Operation["id"];
  date: Date;
  dbInstance?: typeof db;
}) {
  const [updatedOperation] = await dbInstance
    .update(operation)
    .set({
      endTime: date,
    })
    .returning();

  if (!updatedOperation.id)
    return {
      error: "Couldn't update the end time!",
    };

  return {
    operationId: updatedOperation.id,
    message: "End time updated!!",
    error: null,
  };
}

export async function createOperationData({
  data,
  operationId,
}: {
  data: z.infer<typeof presetSchema>;
  operationId: Operation["id"];
}) {
  try {
    return await db.transaction(async (tx) => {
      const operationDataId = generateId();

      const { name } = await getOperationDocument({ dbInstance: tx });

      if (!name) throw new Error("Couldn't get the document");

      const [createdOperationData] = await tx
        .insert(operationData)
        .values({
          id: operationDataId,
          data: data.data,
          documentName: name,
          operationId: operationId,
        })
        .returning();

      if (!createdOperationData.id)
        throw new Error("Failed to create operation data entry!!");

      const updatedOperationData = await updateOperationStatus({
        operationId: operationId,
        status: "completed",
        dbInstance: tx,
      });

      if (updatedOperationData.error)
        throw new Error(updatedOperationData.error);

      const updatedOperationEndTime = await updateOperationEndTime({
        operationId,
        date: new Date(),
        dbInstance: tx,
      });

      if (updatedOperationEndTime.error)
        throw new Error(updatedOperationEndTime.error);

      revalidatePath(`/dashboard/operations/${operationId}`);
      return {
        data: createdOperationData as OperationData,
        message: "Operation data inserted!",
        error: null,
      };
    });
  } catch (error: any) {
    return {
      message: null,
      data: null,
      error: error.message,
    };
  }
}

export async function updateOperationData({
  data,
  operationDataId,
}: {
  data: z.infer<typeof presetSchema>;
  operationDataId: OperationData["id"];
}) {
  const [updatedOperationData] = await db
    .update(operationData)
    .set({
      data: data.data,
    })
    .where(eq(operationData.id, operationDataId))
    .returning();

  if (!updatedOperationData) {
    return {
      error: "Failed to update operation data entry!",
    };
  }

  revalidatePath(`/dashboard/operations/${operationDataId}`);
  return {
    data: updatedOperationData as OperationData,
    message: "Operation data updated successfully!",
    error: null,
  };
}

export const getOperationStatus = async (operationId: Operation["id"]) => {
  const [query] = await db
    .select()
    .from(operation)
    .where(eq(operation.id, operationId));

  return query.status;
};

export async function extractPlaceholders(fileKey: string): Promise<string[]> {
  // Fetch the file from R2 bucket
  const fileBuffer = await fetchFileFromS3(fileKey);

  // Extract raw text using Mammoth
  const { value: text } = await mammoth.extractRawText({ buffer: fileBuffer });

  // Use matchAll() for better performance and clarity
  const placeholderRegex = /\{([^}]+)\}/g;
  const placeholders = new Set(
    [...text.matchAll(placeholderRegex)].map((match) => match[1]),
  );

  return Array.from(placeholders);
}

// Helper function to fetch file from S3
async function fetchFileFromS3(fileKey: string): Promise<Buffer> {
  const { S3_BUCKET_NAME } = process.env;
  if (!S3_BUCKET_NAME) {
    throw new Error("Missing S3_BUCKET_NAME environment variable");
  }

  const { Body } = await s3.send(
    new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileKey }),
  );
  if (!Body) throw new Error("Failed to retrieve file from R2");
  return streamToBuffer(Body as NodeJS.ReadableStream);
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
