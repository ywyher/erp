import { useState } from 'react'
import { getPreSignedUrl } from '@/lib/s3'
import { computeSHA256 } from '@/app/actions'

export function useFileUpload() {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    setProgress(0)

    try {
      const checksum = await computeSHA256(file)
      
      const { success, failure } = await getPreSignedUrl({
        type: file.type,
        size: file.size,
        checksum,
      })

      if (failure) {
        throw new Error(failure.message)
      }

      if (!success) {
        throw new Error('Failed to get pre-signed URL')
      }

      const { url, fileName } = success

      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setProgress(percentComplete)
        }
      }

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.send(file)
      })

      return fileName
    } catch (error) {
      console.error('Upload error:', error)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { handleUpload, progress, isUploading }
}