"use client";

import type { MedicalFile } from "@/lib/db/schema";
import { getFileUrl } from "@/lib/funcs";
import { useMemo } from "react";

type Pdf = {
  src: string;
  type: string;
  alt: string;
};

export default function Pdfs({ files }: { files: MedicalFile[] }) {
  const pdfs = useMemo(
    () =>
      files
        .filter((file) => file.type.startsWith("application/pdf"))
        .map((file) => ({
          src: getFileUrl(file.name) as string,
          alt: file.name,
          type: file.type,
        })),
    [files],
  );

  return (
    <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-4 p-4">
      {pdfs.map((pdf) => (
        <div
          key={pdf.alt}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <iframe
            src={pdf.src}
            title={pdf.alt}
            className="w-full h-[600px] border-none"
          />
        </div>
      ))}
    </div>
  );
}
