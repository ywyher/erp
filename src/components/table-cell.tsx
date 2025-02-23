import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { isFakeEmail } from "@/lib/funcs";
import { ScheduleDisplay } from "@/components/schedule-display";

interface TableCellProps {
    row: Row<any>;
    value: string;
    header: string;
    dialog?: boolean;
    isBoolean?: boolean;
}

export default function TableCell({ row, value, header, dialog, isBoolean }: TableCellProps) {
    const cellValue = row.getValue(value);

    if (cellValue == null || isFakeEmail(row.getValue('email'))) {
        return <span className="text-muted-foreground">Empty</span>;
    }

    if (isBoolean) {
        return cellValue === true ? "Yes" : "No";
    }

    if (value === 'schedules') {
        const schedules = Array.isArray(cellValue) ? cellValue : [cellValue];
        return <ScheduleDisplay schedules={schedules} />;
    }

    return dialog ? (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">View</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{header}</DialogTitle>
                </DialogHeader>
                <div>{cellValue as string}</div>
            </DialogContent>
        </Dialog>
    ) : (
        <span>{cellValue as string}</span>
    );
}