'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState, } from "react"
import { useRouter } from "next/navigation"

export default function CreateAppointment({ userId, role, dialog = true }: { userId: string, role: 'doctor' | 'receptionist', dialog: boolean }) {
    const router = useRouter();

    const [open, setOpen] = useState<boolean>(false)
    const [mode, setMode] = useState<'choose' | 'exist' | 'new'>('choose')

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Create Dialog</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex flex-row gap-2 items-center">
                            {mode != 'choose' &&
                                <Button variant={'outline'} className="cursor-pointer px-2 py-1 h-fit" onClick={() => setMode('choose')} >
                                    Go Back
                                </Button>
                            }
                            Create New Appointment
                        </DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new appointment. All fields are required.
                        </DialogDescription>
                    </DialogHeader>
                    {mode == 'choose' && (
                        <div className="flex flex-row gap-2">
                            <Button
                                className="w-full"
                                variant='secondary'
                                onClick={() => setMode('new')}
                            >
                                New User
                            </Button>
                            <Button
                                className="w-full"
                                onClick={() => setMode('exist')}
                            >
                                Existing User
                            </Button>
                        </div>
                    )}
                    {/* {mode == 'exist' && (
                        <ExistingUser userId={userId} role={role} />
                    )}
                    {mode == 'new' && (
                        <NewUser userId={userId} />
                    )} */}
                </DialogContent>
            </Dialog>
        </>
    )
}