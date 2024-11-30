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
                <CardTitle>Filters Options</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row gap-4 w-full">
                <div className="flex flex-row items-center gap-4 w-full">
                    <NameFilter />
                    <SpecialtyFilter />
                    <DateFilters />
                </div>
                <div className="flex flex-row gap-4">
                    <Button onClick={onApply}>Apply Filters</Button>
                    <Button onClick={onReset}>Reset</Button>
                </div>
            </CardContent>
        </Card>
    )
}