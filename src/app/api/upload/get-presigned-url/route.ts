// app/api/get-presigned-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/auth-client";
import crypto from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// Define file type configurations with their respective max sizes
const fileTypeConfigs = {
  // Images: 4MB
  "image/jpeg": 4 * 1024 * 1024,
  "image/png": 4 * 1024 * 1024,
  "image/gif": 4 * 1024 * 1024,
  "image/webp": 4 * 1024 * 1024,
  // PDFs: 10MB
  "application/pdf": 10 * 1024 * 1024,
  // Word documents: 10MB
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10 * 1024 * 1024,
  // Videos: 10MB
  "video/mp4": 10 * 1024 * 1024,
  // Audio files: 10MB
  "audio/mpeg": 10 * 1024 * 1024, // MP3
  "audio/mp3": 10 * 1024 * 1024, // MP3 alternative
  "audio/wav": 10 * 1024 * 1024, // WAV
  "audio/x-wav": 10 * 1024 * 1024, // WAV alternative
  "audio/wave": 10 * 1024 * 1024, // WAV alternative
  "audio/vnd.wave": 10 * 1024 * 1024, // WAV alternative
  "audio/ogg": 10 * 1024 * 1024, // OGG
  "application/ogg": 10 * 1024 * 1024, // OGG alternative
  "audio/flac": 10 * 1024 * 1024, // FLAC
  "audio/x-flac": 10 * 1024 * 1024, // FLAC alternative
  "audio/aac": 10 * 1024 * 1024, // AAC
  "audio/x-aac": 10 * 1024 * 1024, // AAC alternative
  "audio/mp4": 10 * 1024 * 1024, // AAC in MP4 container
  "audio/x-m4a": 10 * 1024 * 1024, // AAC in M4A container
  "audio/webm": 10 * 1024 * 1024, // WebM audio
};

// Get accepted types from the keys of fileTypeConfigs
const acceptedTypes = Object.keys(fileTypeConfigs);

export async function POST(req: NextRequest) {
  const { data: session } = await getSession({
    fetchOptions: {
      headers: req.headers,
    },
  });

  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  
  const { type, size, checksum } = await req.json();

  if (!acceptedTypes.includes(type)) {
    return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
  }

  // Get the max size for this specific file type
  const maxFileSize = fileTypeConfigs[type as keyof typeof fileTypeConfigs];

  if (size > maxFileSize) {
    return NextResponse.json(
      { message: `File size too large. Maximum allowed for ${type} is ${maxFileSize / (1024 * 1024)}MB` },
      { status: 400 },
    );
  }

  const fileName = generateFileName();

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: session.user.id,
    },
  });

  try {
    const preSignedUrl = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 3600,
    });
    return NextResponse.json({ key: fileName, url: preSignedUrl, name: fileName, type, size });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate pre-signed URL" },
      { status: 500 },
    );
  }
}