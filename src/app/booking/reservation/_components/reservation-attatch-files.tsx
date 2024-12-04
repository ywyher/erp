"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { getErrorMessage } from "@/lib/handle-error"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { FileUploader } from "@/components/file-uploader"
import { saveMedicalFilesInDb } from "@/app/booking/reservation/actions"
import { useAppointmentReservationStore } from "@/components/doctors/store"
import { useFileUpload } from "@/hooks/use-upload-file"
import { useRouter } from "next/navigation"
import LoadingBtn from "@/components/loading-btn"

const schema = z.object({
    files: z.array(z.instanceof(File)),
})

type Schema = z.infer<typeof schema>

export default function ReservationAttatchFiles() {
    const { handleUpload, uploadedFiles, isUploading } = useFileUpload()
    const reservation = useAppointmentReservationStore((state) => state.reserved);
    const setReserved = useAppointmentReservationStore((state) => state.setReserved);
    const router = useRouter();

    const form = useForm<Schema>({
        resolver: zodResolver(schema),
        defaultValues: {
            files: [],
        },
    })

    React.useEffect(() => {
        const intervalId = setInterval(async () => {
            if (!reservation.appointmentId || uploadedFiles.length === 0 || isUploading) return;

            const allUploaded = uploadedFiles.every(file => file.progress === 100);
            if (allUploaded) {
                clearInterval(intervalId); // Stop the interval after files are saved
                console.log('done');
                try {
                    const result = await saveMedicalFilesInDb({
                        appointmentId: reservation.appointmentId,
                        files: uploadedFiles,
                    });

                    if (result?.error) {
                        toast.error(result.error as string);
                    } else {
                        toast.success("Files uploaded and saved successfully");
                        router.push('/dashboard/appointments')
                        form.reset();
                    }
                } catch (error) {
                    toast.error(getErrorMessage(error));
                }
            }
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [uploadedFiles, reservation.appointmentId, form, isUploading]);

    async function onSubmit(input: Schema) {
        if (!reservation.appointmentId) return;
        if (input.files.length == 0) {
            toast.error('Please select files to upload');
            return;
        }
        try {
            toast.promise(handleUpload(input.files), {
                loading: 'Uploading files...',
                error: (error) => getErrorMessage(error)
            });
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-3"
            >
                <FormField
                    control={form.control}
                    name="files"
                    render={({ field }) => (
                        <div className="space-y-6">
                            <FormItem className="w-full">
                                <FormLabel className="text-lg font-bold">Attatch files for the doctor</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        maxFileCount={10}
                                        maxSize={5 * 1024 * 1024}
                                        disabled={isUploading}
                                        progresses={Object.fromEntries(
                                            uploadedFiles.map(file => [file.name, file.progress || 0])
                                        )}
                                        accept={{
                                            'image/*': [''],
                                            'application/pdf': [''],
                                        }}

                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            {/* {uploadedFiles.length > 0 ? (
                                <UploadedFilesCard uploadedFiles={uploadedFiles} />
                            ) : null} */}
                        </div>
                    )}
                />
                <LoadingBtn isLoading={isUploading} label="Send Files" />
            </form>
        </Form>
    )
}