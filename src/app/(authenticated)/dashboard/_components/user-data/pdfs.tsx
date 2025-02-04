"use client"

import type { medicalFile } from "@/lib/db/schema"
import { getFileUrl } from "@/lib/funcs"
import { useEffect, useState } from "react"

type Pdf = {
  src: string
  type: string
  alt: string
}

export default function Pdfs({ files }: { files: medicalFile[] }) {
  const [pdfs, setPdfs] = useState<Pdf[]>()

  useEffect(() => {
    if (files.length > 0) {
      const formattedPdfs = files
        .filter((file) => file.type.startsWith("application/pdf"))
        .map((file) => ({
          src: getFileUrl(file.name) as string,
          alt: file.name,
          type: file.type,
        }))
      setPdfs(formattedPdfs)
    }
  }, [files])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {pdfs?.map((pdf) => (
        <div key={pdf.alt} className="bg-white rounded-lg shadow-md overflow-hidden">
          <iframe src={pdf.src} title={pdf.alt} className="w-full h-[600px] border-none" />
        </div>
      ))}
    </div>
  )
}