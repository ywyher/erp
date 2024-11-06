'use server'

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { headers } from 'next/headers';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSession } from '@/lib/auth-client';
import crypto from 'crypto'

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const maxFileSize = 5 * 1024 * 1024

export async function getPreSignedUrl({
    type,
    size,
    checksum
}: {
    type: string,
    size: number,
    checksum: string
}) {
    const requestHeaders = await headers();

    const { data } = await getSession({
        fetchOptions: {
            headers: requestHeaders,
        }
    });

    if (!data || !data.user) {
        return {
            failure: {
                message: 'Not authenticated'
            }
        };
    }

    if (!acceptedTypes.includes(type)) throw new Error('Invalid file type')
    if (size > maxFileSize) throw new Error('File size too large');

    const fileName = generateFileName();

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        ContentType: 'image/jpg', // Add a content type if necessary
        ContentLength: size,
        ChecksumSHA256: checksum,
        Metadata: {
            userId: data.user.id
        }
    });

    const preSignedUrl = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 3600
    });


    return { success: { url: preSignedUrl, fileName: fileName } };
}

export async function deleteFile(fileName: string) {
    const requestHeaders = await headers();

    const { data } = await getSession({
        fetchOptions: {
            headers: requestHeaders,
        }
    });

    if (!data || !data.user) {
        return {
            failure: {
                message: 'Not authenticated'
            }
        };
    }
    const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
    });

    try {
        await s3.send(deleteObjectCommand);
    } catch (error) {
        console.error(`Error deleting file from S3: ${name}`, error);
    }
}