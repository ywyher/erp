"use server";

import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/auth-client";
import crypto from "crypto";
import { s3 } from "@/lib/utils";

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];
const maxFileSize = 11 * 1024 * 1024;

export async function getPreSignedUrl({
  type,
  size,
  checksum,
}: {
  type: string;
  size: number;
  checksum: string;
}) {
  const requestHeaders = await headers();

  const { data } = await getSession({
    fetchOptions: {
      headers: requestHeaders,
    },
  });

  if (!data || !data.user) {
    return {
      failure: {
        message: "Not authenticated",
      },
    };
  }

  if (!acceptedTypes.includes(type)) throw new Error("Invalid file type");
  if (size > maxFileSize) throw new Error("File size too large");

  const fileName = generateFileName();

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: data.user.id,
    },
  });

  const preSignedUrl = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 3600,
  });

  return { success: { url: preSignedUrl, fileName: fileName } };
}

export async function deleteFile(fileName: string) {
  const requestHeaders = await headers();

  const { data } = await getSession({
    fetchOptions: {
      headers: requestHeaders,
    },
  });

  if (!data || !data.user) {
    return {
      failure: {
        message: "Not authenticated",
      },
    };
  }
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
  });

  try {
    const sent = await s3.send(deleteObjectCommand);

    if(!sent) throw new Error("Failed to delete file")

    return {
      message: "File deleted!",
      error: null,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { message: null, error: error.message };
    } else {
      return { message: null, error: "Failed to delete file!" };
    }
  }
}