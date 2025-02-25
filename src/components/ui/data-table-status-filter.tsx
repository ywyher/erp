"use client"

import { Table } from "@tanstack/react-table"
import { Clock, Loader2, CheckCircle2, XCircle, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

type StatusType = 'pending' | 'ongoing' | 'completed' | 'cancelled'

type StatusConfig = {
  label: string
  icon: React.ReactNode
}

interface DataTableStatusFilterProps<TData> {
  table: Table<TData>
}

export function DataTableStatusFilter<TData>({
  table,
}: DataTableStatusFilterProps<TData>) {
  // Status configuration with icons
  const statusConfig: Record<StatusType, StatusConfig> = {
    pending: { 
      label: 'Pending', 
      icon: <Clock className="h-4 w-4" />
    },
    ongoing: { 
      label: 'Ongoing', 
      icon: <Loader2 className="h-4 w-4" />
    },
    completed: { 
      label: 'Completed', 
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    cancelled: { 
      label: 'Cancelled', 
      icon: <XCircle className="h-4 w-4" />
    }
  }

  const statuses: StatusType[] = ['pending', 'ongoing', 'completed', 'cancelled']
  
  // Get the status column
  const statusColumn = table.getColumn('status')
  if (!statusColumn) return null

  // Get active status filters
  const statusFilters = statusColumn.getFilterValue() as string[] || []
  
  // Function to toggle status filter
  const toggleStatusFilter = (status: string) => {
    const currentFilters = statusColumn.getFilterValue() as string[] || []
    if (currentFilters.includes(status)) {
      statusColumn.setFilterValue(currentFilters.filter(s => s !== status))
    } else {
      statusColumn.setFilterValue([...currentFilters, status])
    }
  }

  // Get all rows (before status filtering)
  const allRows = table.getCoreRowModel().rows
  
  // Count rows by status from all rows (not filtered)
  const statusCounts: Record<string, number> = {}
  statuses.forEach(status => {
    statusCounts[status] = allRows.filter(
      row => (row.original as any).status === status
    ).length
  })

  // Count selected rows by status
  const selectedRows = table.getSelectedRowModel().rows
  const selectedStatusCounts: Record<string, number> = {}
  statuses.forEach(status => {
    selectedStatusCounts[status] = selectedRows.filter(
      row => (row.original as any).status === status
    ).length
  })

  // Calculate total active filters
  const totalActiveStatusFilters = statusFilters.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2">
          <Filter className="h-4 w-4" />
          Status
          {totalActiveStatusFilters > 0 && (
            <Badge className="ml-1" variant="secondary">
              {totalActiveStatusFilters}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit">
        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statuses.map((status) => (
          <DropdownMenuItem 
            key={status} 
            onSelect={(e) => { 
              e.preventDefault(); 
              toggleStatusFilter(status); 
            }} 
            className="flex justify-between items-center gap-3"
          >
            <div className="flex items-center gap-3">
              <Checkbox 
                id={`status-${status}`}
                checked={statusFilters.includes(status)}
              />
              <div className="flex items-center gap-3">
                {statusConfig[status].icon}
                <span className="text-sm">{statusConfig[status].label}</span>
                <Badge variant="outline">
                  {statusCounts[status]}
                </Badge>
              </div>
            </div>
            {selectedStatusCounts[status] > 0 && (
              <Badge variant="secondary">
                {selectedStatusCounts[status]} selected
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}