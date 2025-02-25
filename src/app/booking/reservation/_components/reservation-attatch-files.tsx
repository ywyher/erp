"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { useRouter } from "next/navigation"
import LoadingBtn from "@/components/loading-btn"
import { useFileUpload } from "@/hooks/use-upload-file"
import { toast } from "sonner"
import { deleteFile } from "@/lib/s3"

const schema = z.object({
    files: z.array(z.instanceof(File)),
})

type Schema = z.infer<typeof schema>

export default function ReservationAttatchFiles() {
    const [isLoading, setIsLoading] = React.useState(false);
    const { handleUpload, progresses } = useFileUpload();
    const reservation = useAppointmentReservationStore((state) => state.reserved);
    const setReserved = useAppointmentReservationStore((state) => state.setReserved);
    const router = useRouter();

    const form = useForm<Schema>({
        resolver: zodResolver(schema),
        defaultValues: {
            files: [],
        },
    })

    async function onSubmit(input: Schema) {
        if (!input.files.length) {
            toast.error('Please upload at least one file');
            return;
        }
        if (!reservation.appointmentId) {
            toast.error('Please select an appointment');
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Uploading files...');

        try {
            const uploadPromises = input.files.map(async (file) => {
                const fileName = await handleUpload(file);

                if (!fileName) {
                    setIsLoading(false);
                    throw new Error('Failed to upload file');
                }

                try {
                    await saveMedicalFilesInDb({
                        name: fileName,
                        type: file.type,
                        appointmentId: reservation.appointmentId as string,
                        patientId: reservation.patientId as string
                    });
                } catch (dbError) {
                    console.error("Database error:", dbError);

                    await deleteFile(fileName);
                    throw new Error(`Failed to save file ${file.name} to the database. It has been deleted.`);
                }
            });

            await Promise.all(uploadPromises);

            toast.success('All files have been uploaded and saved successfully', {
                id: toastId,
            });
            form.reset();
            setReserved({ reserved: false, appointmentId: null, patientId: null })
            router.replace('/dashboard/appointments');
            setIsLoading(false);
        } catch (err) {
            const errorMessage = toast.error(err as string);
            toast.error(errorMessage);
            form.setError('files', { type: 'manual', message: errorMessage.toString() });
            setIsLoading(false);
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
                                <FormLabel className="text-lg font-bold">Attach files for the doctor</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        maxFileCount={10}
                                        maxSize={11 * 1024 * 1024}
                                        disabled={isLoading}
                                        accept={{
                                            'image/*': [''],
                                            'application/pdf': [''],
                                            'video/mp4': ['']
                                        }}
                                        progresses={progresses}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </div>
                    )}
                />
                <LoadingBtn isLoading={isLoading}>
                    Send Files
                </LoadingBtn>
            </form>
        </Form>
    )
}