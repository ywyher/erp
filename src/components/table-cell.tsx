import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFileUrl, isFakeEmail } from "@/lib/funcs";
import { ScheduleDisplay } from "@/components/schedule-display";
import UserDataDialog from "@/app/(authenticated)/dashboard/_components/user-data-dialog";
import Image from "next/image";

interface TableCellProps {
  row: Row<any>;
  value: string;
  header: string;
  dialog?: boolean;
  isBoolean?: boolean;
}

export default function TableCell({
  row,
  value,
  header,
  dialog,
  isBoolean,
}: TableCellProps) {
  const cellValue = row.getValue(value);

  const hasEmailColumn = row
    .getAllCells()
    .some((cell) => cell.column.id === "email");
  const emailValue = hasEmailColumn ? row.getValue("email") : null;

  if (cellValue == null || (emailValue && isFakeEmail(emailValue as string))) {
    return <span className="text-muted-foreground">Empty</span>;
  }

  if (isBoolean) {
    return cellValue === true ? "Yes" : "No";
  }

  if (value === "schedules") {
    const schedules = Array.isArray(cellValue) ? cellValue : [cellValue];
    return <ScheduleDisplay schedules={schedules} />;
  }

  if (value === "doctorId") {
    if (row.getValue("role") != "doctor") {
      return <UserDataDialog userId={cellValue as string} role="doctor" />;
    } else {
      return <span className="text-muted-foreground">Empty</span>;
    }
  }

  if (value === "patientId") {
    if (row.getValue("role") != "user") {
      return <UserDataDialog userId={cellValue as string} role="user" />;
    } else {
      return <span className="text-muted-foreground">Empty</span>;
    }
  }

  if (value === "thumbnail") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            View
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{header}</DialogTitle>
          </DialogHeader>
          <Image
            src={getFileUrl(cellValue as string)}
            alt={getFileUrl(cellValue as string)}
            layout="responsive"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>
    )
  }

  return dialog ? (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
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
