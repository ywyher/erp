import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import libre from 'libreoffice-convert';

// Helper to convert the file
const convertToPdf = (inputPath: string, outputPath: string) =>
    new Promise<void>((resolve, reject) => {
        const extend = '.pdf';

        const fileBuffer = fs.readFileSync(inputPath);
        libre.convert(fileBuffer, extend, undefined, (err, done) => {
            if (err) {
                reject(err);
            } else {
                fs.writeFileSync(outputPath, done);
                resolve();
            }
        });
    });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { file } = body;

        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        // Temporary file paths
        const inputPath = path.join('/tmp', 'file.docx');
        const outputPath = path.join('/tmp', 'converted.pdf');

        // Write the uploaded .docx file to the server
        fs.writeFileSync(inputPath, Buffer.from(file, 'base64'));

        // Convert the .docx file to PDF
        await convertToPdf(inputPath, outputPath);

        // Read the converted PDF file
        const pdfBuffer = fs.readFileSync(outputPath);

        // Clean up temporary files
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

        // Return the PDF as a response
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=converted.pdf',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error converting file', error: error },
            { status: 500 }
        );
    }
}