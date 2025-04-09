import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import libre from "libreoffice-convert";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

// Create a promisified version of the convert function with the LibreOffice path
const convertAsync = (inputBuffer: Buffer, outputFormat: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const options = {
      // Use environment variable or a fallback path
      sofficeBinaryPaths: [process.env.LIBREOFFICE_PATH || '/home/ywyh/.nix-profile/bin/soffice']
    };
    
    libre.convertWithOptions(inputBuffer, outputFormat, undefined, options, (err: Error | null, done: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });
};

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
    
    // Write DOCX file to temp storage
    await fs.writeFile(tempInputPath, inputBuffer);
    
    // Convert DOCX to PDF using our promisified function
    const outputBuffer = await convertAsync(inputBuffer, ".pdf");
    
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
      { status: 500 }
    );
  }
}