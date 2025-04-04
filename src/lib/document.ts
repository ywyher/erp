import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

// Define a type for PizZipUtils
type PizZipUtilsType = {
  getBinaryContent: (
    url: string,
    callback: (error: Error | null, content?: string) => void,
  ) => void;
};

// Declare PizZipUtils as a promise that resolves to PizZipUtilsType
let PizZipUtilsPromise: Promise<PizZipUtilsType> | null = null;

if (typeof window !== "undefined") {
  PizZipUtilsPromise = import("pizzip/utils/index.js").then(
    (module) => module as unknown as PizZipUtilsType,
  );
}

async function loadFile(url: string): Promise<string> {
  if (!PizZipUtilsPromise) {
    throw new Error("PizZipUtils is not available");
  }
  const PizZipUtils = await PizZipUtilsPromise;
  return new Promise((resolve, reject) => {
    PizZipUtils.getBinaryContent(
      url,
      (error: Error | null, content?: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(content || "");
        }
      },
    );
  });
}

export const generateDocument = async ({
  data,
  filePath,
  download = false,
}: {
  data: Record<string, string>;
  filePath: string;
  download?: boolean;
}) => {
  if (!filePath) return;

  try {
    const content = await loadFile(filePath);
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      linebreaks: true,
      paragraphLoop: true,
    });

    // Dynamically map the data to the placeholders
    const renderData: Record<string, string> = {};
    for (const key in data) {
      renderData[key] = data[key];
    }

    // Render the document with the dynamic data
    doc.render(renderData);

    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Output the document using Data-URI
    if (download) {
      saveAs(blob, "output.docx");
    }

    return {
      blob,
    };
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
};
