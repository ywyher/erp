"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FileUploader } from "@/components/file-uploader"
import { useFileUpload } from "@/hooks/use-upload-file"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { createSetting, updateSetting } from "@/app/(authenticated)/dashboard/settings/actions"
import type { settingSchema } from "@/app/(authenticated)/dashboard/settings/types"
import LoadingBtn from "@/components/loading-btn"
import type { User } from "@/lib/db/schema"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Upload, Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFileUrl } from "@/lib/funcs"

const schema = z.object({
  file: z.array(z.instanceof(File)),
})

type Schema = z.infer<typeof schema>

export default function OperationDocumentUrl({
  userId,
  currentUrl,
}: {
  userId: User["id"]
  currentUrl: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { handleUpload, progresses, setProgresses, setIsUploading } = useFileUpload()
  const [showAlert, setShowAlert] = useState(false)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      file: [],
    },
  })

  const onSubmit = async (input: Schema) => {
    setShowAlert(true)
  }

  const handleConfirmedUpload = async () => {
    setIsLoading(true)
    const input = form.getValues()

    if(!input.file[0]) {
      toast.error('No file uploadad!')
      setIsLoading(false)
      setShowAlert(false)
      return;
    }

    const fileName = await handleUpload(input.file[0])

    if (!fileName) {
      setIsLoading(false)
      throw new Error("Failed to upload file")
    }

    const data: z.infer<typeof settingSchema> = {
      key: "operation-document-url",
      value: fileName,
      description: "Operation document url",
    }

    let result: { message?: string; error: string | null; settingId?: string }
    if (currentUrl) {
      result = await updateSetting({ data, editorId: userId, settingKey: "operation-document-url" })
    } else {
      result = await createSetting({ data, creatorId: userId })
    }

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.message(result.message)
    setProgresses({})
    setIsUploading(false)
    form.reset()
    setIsLoading(false)
    setShowAlert(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload Operation Document
          </CardTitle>
          {currentUrl && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={getFileUrl(currentUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Current Document
              </a>
            </Button>
          )}
        </div>
        <CardDescription>
          Attach files for the doctor. Accepted format: .docx (Word document)
          {currentUrl && (
            <p className="mt-2 text-sm text-muted-foreground">
              A document is currently uploaded. Uploading a new one will replace the existing document.
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-base font-semibold">Document Upload</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={field.value}
                      onValueChange={field.onChange}
                      maxFileCount={1}
                      maxSize={11 * 1024 * 1024}
                      disabled={isLoading}
                      accept={{
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [""],
                      }}
                      progresses={progresses}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
          <AlertDialogTrigger asChild>
            <Button className="w-full" onClick={form.handleSubmit(onSubmit)}>
              Upload Document
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Document Upload</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    Uploading a new document will replace the current one. However, please note:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>All previous documents and associated data will remain accessible in the system.</li>
                      <li>Historical records and analytics will not be affected by this update.</li>
                      <li>
                        Users with appropriate permissions can still view and reference past documents when needed.
                      </li>
                    </ul>
                    Are you sure you want to proceed with uploading the new document?
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmedUpload}>Confirm Upload</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}