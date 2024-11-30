'use client'

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { Input } from "@/components/ui/input"
import { searchUsers } from "@/lib/db/queries"
import { User } from "@/lib/db/schema"
import { useDebounce } from "use-debounce"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MoreHorizontal, Loader2, UserPlus } from 'lucide-react'
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExistingUser({ userId, role, setPatientId, setIsCreateUser }: {
    userId: string,
    role: 'doctor' | 'receptionist',
    setPatientId: Dispatch<SetStateAction<User['id'] | null>>
    setIsCreateUser: Dispatch<SetStateAction<boolean>>
}) {
    const router = useRouter()
    const { toast } = useToast()

    const [searchQuery, setSearchQuery] = useState<string>('')
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState<boolean>(false)

    const [debouncedSearchQuery] = useDebounce(searchQuery, 300)

    const handleSearch = async (query: string) => {
        setIsSearching(true)
        try {
            const results = await searchUsers(query, 'all')
            setSearchResults(results)
        } catch (error) {
            console.error('Error searching patients:', error)
            toast({
                title: "Error searching patients",
                description: "Please try again later",
                variant: "destructive"
            })
        } finally {
            setIsSearching(false)
        }
    }

    useEffect(() => {
        if (debouncedSearchQuery.trim() !== '') {
            handleSearch(debouncedSearchQuery)
        } else {
            setSearchResults([])
        }
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
            createdBy: role,
        })

        if (result?.success) {
            toast({
                title: "Appointment created successfully",
                description: result.message,
            })
            setSearchQuery('')
            router.push(`/dashboard/appointments/${result.appointmentId}`)
        } else {
            toast({
                title: "Failed to create appointment",
                description: result?.message || "An error occurred",
                variant: "destructive"
            })
        }
    }

    const handlePatientSelection = (patient: User) => {
        if (role === 'receptionist') {
            setPatientId(patient.id)
            setSearchQuery('')
            setIsSearching(false)
        }
        if (role === 'doctor') {
            handleCreateAppointment(patient.id, userId)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Reserve an Appointment</CardTitle>
                <CardDescription>
                    Search for existing patients or create a new user
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-1">
                            <Input
                                placeholder={`Search for existing patients`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            )}
                        </div>
                        <Button className="ml-4" onClick={() => setIsCreateUser(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            New User
                        </Button>
                    </div>

                    <div className="rounded-md border">
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
                                {searchResults.length > 0 ? (
                                    searchResults.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email || 'N/A'}</TableCell>
                                            <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-40" align="end">
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start"
                                                            onClick={() => {
                                                                handlePatientSelection(user)
                                                            }}
                                                        >
                                                            Select
                                                        </Button>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {debouncedSearchQuery.trim() === ''
                                                ? "Enter a search query to find patients."
                                                : "No results found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}