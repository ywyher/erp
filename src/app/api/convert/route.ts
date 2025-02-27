import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import libre from "libreoffice-convert";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Generate a temporary file path
    const tempId = uuidv4();
    const tempInputPath = path.join(tmpdir(), `${tempId}.docx`);
    const tempOutputPath = path.join(tmpdir(), `${tempId}.pdf`);

    // Write DOCX file to temp storage
    await fs.writeFile(tempInputPath, inputBuffer);

    // Convert DOCX to PDF
    const outputBuffer: Buffer = await new Promise((resolve, reject) => {
      libre.convert(inputBuffer, ".pdf", undefined, (err, done) => {
        if (err) {
          return reject(err);
        }
        resolve(done);
      });
    });

    // Clean up DOCX file
    await fs.unlink(tempInputPath);

    // Send back the PDF as a response
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="output.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error converting DOCX to PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
