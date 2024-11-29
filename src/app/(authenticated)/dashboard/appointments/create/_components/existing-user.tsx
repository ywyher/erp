'use client'

import { Dispatch, SetStateAction, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { searchUsers } from "@/lib/db/queries"
import { User } from "@/lib/db/schema"
import { useDebounce } from "use-debounce"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MoreHorizontal } from 'lucide-react'
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Roles } from "@/app/types"

export default function ExistingUser({ userId, role }: { userId: string, role: 'doctor' | 'receptionist' }) {
    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState<string>('')
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [searchFor, setSearchFor] = useState<'patient' | 'doctor'>('patient')

    const [patientData, setPatientData] = useState<User>()

    const [debouncedSearchQuery] = useDebounce(searchQuery, 300)

    const { toast } = useToast()

    const handleSearch = async (query: string, role: 'doctor' | 'patient' | 'user') => {
        if (role == 'patient') {
            role = 'user'
        }

        if (query.trim() === '') {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const results = await searchUsers(query, role)
            setSearchResults(results)
        } catch (error) {
            console.error('Error searching patients:', error)
        } finally {
            setIsSearching(false)
        }
    }

    useEffect(() => {
        handleSearch(debouncedSearchQuery, searchFor)
    }, [debouncedSearchQuery])

    const handleCreateAppointment = async (patientId: string, doctorId: string) => {
        if (!patientId) {
            toast({
                title: "Patient id not found!",
                variant: 'destructive'
            })
            return;
        }

        const result = await createAppointment({
            patientId: patientId,
            doctorId: doctorId,
            receptionistId: role == 'receptionist' ? userId : undefined
        })

        if (result?.success) {
            toast({
                title: "Appointment created successfully redirecting...",
                description: result.message,
            })
            setSearchQuery('')
            router.push(`/dashboard/appointments/${result.appointmentId}`)
        }
    }

    const handlePatientSelection = (patient: User) => {
        if (role === 'receptionist') {
            setPatientData(patient)
            setSearchQuery('')
            setSearchQuery('')
            setIsSearching(false)
            setSearchFor('doctor')
        }
        if (role === 'doctor') {
            handleCreateAppointment(patient.id, userId)
        }
    }

    const handleDoctorSelection = (doctor: User) => {
        if (!patientData?.id) return;
        handleCreateAppointment(patientData.id, doctor.id)
    }

    return (
        <div className="space-y-4">
            <Input
                placeholder={`Search for existing ${searchFor}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={`Search for existing ${searchFor}`}
            />
            {patientData && <span>Patient: {patientData.name}</span>}
            {isSearching && <p>Searching...</p>}
            {searchResults.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {searchResults.map((user, index) => (
                            <TableRow key={index}>
                                <TableCell className="capitalize">{user.name}</TableCell>
                                <TableCell>{user.email || 'Empty'}</TableCell>
                                <TableCell>{user.phoneNumber || 'Empty'}</TableCell>
                                <TableCell>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit p-1" align="start">
                                            <div className="grid gap-4">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        if (searchFor == 'patient') {
                                                            handlePatientSelection(user)
                                                        }
                                                        if (searchFor == 'doctor') {
                                                            handleDoctorSelection(user)
                                                        }
                                                    }}
                                                >
                                                    Select
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {!isSearching && searchQuery && searchResults.length === 0 && (
                <p className="mt-2">No patients found.</p>
            )}
        </div>
    )
} 