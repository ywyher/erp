import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { EmptyCard } from "@/components/empty-card"
import { getImageUrl } from "@/lib/funcs"

export function UploadedFilesCard({ uploadedFiles }: { uploadedFiles: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded files</CardTitle>
        <CardDescription>View the uploaded files here</CardDescription>
      </CardHeader>
      <CardContent>
        {uploadedFiles.length > 0 ? (
          <ScrollArea className="pb-4">
            <div className="flex w-max space-x-2.5">
              {uploadedFiles.map((file, index) => (
                <>
                  {file.type.startsWith("image/") && (
                    <div key={file.name} className="relative aspect-video w-64">
                      <Image
                        src={getImageUrl(file.name)}
                        alt={file.name}
                        fill
                        sizes="(min-width: 640px) 640px, 100vw"
                        loading="lazy"
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                </>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <EmptyCard
            title="No files uploaded"
            description="Upload some files to see them here"
            className="w-full"
          />
        )}
      </CardContent>
    </Card>
  )
}
