"use client";

import { Table } from "@tanstack/react-table";
import { Clock, Loader2, CheckCircle2, XCircle, Filter, FileText, Globe, EyeOff, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define all status types
type TaskStatusType = "pending" | "ongoing" | "completed" | "cancelled";
type PostStatusType = "draft" | "published" | "inactive" | "archived";

// Union type for all possible statuses
type StatusType = TaskStatusType | PostStatusType;

// Define the config types
type StatusConfig = {
  label: string;
  icon: React.ReactNode;
};

// Define available status configurations
export type StatusConfigType = "tasks" | "posts";

interface DataTableStatusFilterProps<TData> {
  table: Table<TData>;
  // Add configType parameter to select which status config to use
  configType?: StatusConfigType;
}

export function DataTableStatusFilter<TData>({
  table,
  configType = "tasks", // Default to tasks config
}: DataTableStatusFilterProps<TData>) {
  // Status configurations with icons
  const statusConfigs: Record<StatusConfigType, Record<string, StatusConfig>> = {
    tasks: {
      pending: {
        label: "Pending",
        icon: <Clock className="h-4 w-4" />,
      },
      ongoing: {
        label: "Ongoing",
        icon: <Loader2 className="h-4 w-4" />,
      },
      completed: {
        label: "Completed",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      cancelled: {
        label: "Cancelled",
        icon: <XCircle className="h-4 w-4" />,
      },
    },
    posts: {
      draft: {
        label: "Draft",
        icon: <FileText className="h-4 w-4" />,
      },
      published: {
        label: "Published",
        icon: <Globe className="h-4 w-4" />,
      },
      inactive: {
        label: "Inactive",
        icon: <EyeOff className="h-4 w-4" />,
      },
      archived: {
        label: "Archived",
        icon: <Archive className="h-4 w-4" />,
      },
    },
  };

  // Get the active status config based on configType
  const activeStatusConfig = statusConfigs[configType];
  
  // Get statuses from the active config
  const statuses = Object.keys(activeStatusConfig);

  // Get the status column
  const statusColumn = table.getColumn("status");
  if (!statusColumn) return null;

  // Get active status filters
  const statusFilters = (statusColumn.getFilterValue() as string[]) || [];

  // Function to toggle status filter
  const toggleStatusFilter = (status: string) => {
    const currentFilters = (statusColumn.getFilterValue() as string[]) || [];
    if (currentFilters.includes(status)) {
      statusColumn.setFilterValue(currentFilters.filter((s) => s !== status));
    } else {
      statusColumn.setFilterValue([...currentFilters, status]);
    }
  };

  // Get all rows (before status filtering)
  const allRows = table.getCoreRowModel().rows;

  // Count rows by status from all rows (not filtered)
  const statusCounts: Record<string, number> = {};
  statuses.forEach((status) => {
    statusCounts[status] = allRows.filter(
      (row) => (row.original as any).status === status,
    ).length;
  });

  // Count selected rows by status
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedStatusCounts: Record<string, number> = {};
  statuses.forEach((status) => {
    selectedStatusCounts[status] = selectedRows.filter(
      (row) => (row.original as any).status === status,
    ).length;
  });

  // Calculate total active filters
  const totalActiveStatusFilters = statusFilters.length;

  // Get label based on config type
  const configLabels: Record<StatusConfigType, string> = {
    tasks: "Status",
    posts: "Post Status"
  };
  
  const filterLabel = configLabels[configType];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2">
          <Filter className="h-4 w-4" />
          {filterLabel}
          {totalActiveStatusFilters > 0 && (
            <Badge className="ml-1" variant="secondary">
              {totalActiveStatusFilters}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit">
        <DropdownMenuLabel>Filter by {filterLabel.toLowerCase()}</DropdownMenuLabel>
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
                {activeStatusConfig[status].icon}
                <span className="text-sm">{activeStatusConfig[status].label}</span>
                <Badge variant="outline">{statusCounts[status]}</Badge>
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
  );
}