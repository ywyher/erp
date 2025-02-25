'use client'

import SpecialtyFilter from "@/components/doctors/filters/specialty-filters"
import DateFilters from "@/components/doctors/filters/date-filters"
import NameFilter from "@/components/doctors/filters/name-filter"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DoctorsFilters({ onApply, onReset }: { onApply: () => void, onReset: () => void }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                    <NameFilter />
                    <SpecialtyFilter />
                    <DateFilters />
                </div>
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                    <Button onClick={onApply} className="w-full lg:w-auto">Apply Filters</Button>
                    <Button onClick={onReset} className="w-full lg:w-auto">Reset</Button>
                </div>
            </CardContent>
        </Card>
    )
}