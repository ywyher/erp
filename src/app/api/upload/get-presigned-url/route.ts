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

const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
];
const maxFileSize = 11 * 1024 * 1024;

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

  if (size > maxFileSize) {
    return NextResponse.json(
      { message: "File size too large" },
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
    return NextResponse.json({ url: preSignedUrl, fileName });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json(
      { message: "Failed to generate pre-signed URL" },
      { status: 500 },
    );
  }
}
