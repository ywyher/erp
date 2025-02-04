"use client"

import type { MedicalFile, medicalFile } from "@/lib/db/schema"
import { getFileUrl } from "@/lib/funcs"
import { useEffect, useState } from "react"

type Video = {
  src: string
  alt: string
  type: string
}

export default function Videos({ files }: { files: MedicalFile[] }) {
  const [videos, setVideos] = useState<Video[]>()

  useEffect(() => {
    if (files.length > 0) {
      const formattedVideos = files
        .filter((file) => file.type.startsWith("video"))
        .map((file) => ({
          src: getFileUrl(file.name) as string,
          alt: file.name,
          type: file.type,
        }))
      setVideos(formattedVideos)
    }
  }, [files])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos?.map((video) => (
          <div
            key={video.alt}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
          >
            <video className="w-full max-h-90 object-cover" controls>
              <source src={`${video.src}`} type={video.type} />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    </div>
  )
}