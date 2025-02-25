"use client"

import { Table } from "@tanstack/react-table"
import { X, Trash2, FileDown, Settings, Check } from "lucide-react"
import { useState } from "react"
import { utils, writeFile } from "xlsx"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteById } from "@/lib/db/mutations"
import { DataTableStatusFilter } from "@/components/ui/data-table-status-filter"
import { Checkbox } from "@/components/ui/checkbox"

interface DataTableToolbarProps<TData extends { id: string }> {
  table: Table<TData>
  filters: string[]
  bulkTableName: string
}

export function DataTableToolbar<TData extends { id: string }>({
  table,
  filters,
  bulkTableName,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getSelectedRowModel().rows
  const [open, setOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState(filters[0])

  const handleDelete = async () => {
    for (const row of selectedRows) {
      await deleteById(row.original.id, bulkTableName)
    }
    setOpen(false)
    table.resetRowSelection()
  }

  const handleExport = () => {
    const dataToExport = selectedRows.map((row) => row.original)
    const worksheet = utils.json_to_sheet(dataToExport)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Data")
    writeFile(workbook, "export.xlsx")
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Filter Via ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}...`}
          value={(table.getColumn(activeFilter)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(activeFilter)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filters.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 px-2">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {filters.map((filter) => (
                <DropdownMenuCheckboxItem 
                  key={filter} 
                  className="flex flex-row gap-4 capitalize"
                  checked={filter == activeFilter}
                  onCheckedChange={(value) => setActiveFilter(filter)}
                >
                  {filter}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isFiltered && (
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {/* Status Filter Component */}
        {table.getAllColumns().some(col => col.id === "status") && (
          <DataTableStatusFilter table={table} />
        )}
        {selectedRows.length > 0 && (
          <>
            <Button variant="destructive" onClick={() => setOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" /> Export Selected
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete {selectedRows.length} selected item(s)?</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}