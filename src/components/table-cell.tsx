'use client'

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
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plate } from "@udecode/plate/react";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { useCreateEditor } from "@/components/editor/use-create-editor";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface TableCellProps {
  row: Row<any>;
  value: string;
  header: string;
  dialog?: boolean;
  editor?: boolean;
  isBoolean?: boolean;
  readMore?: boolean;
  maxChars?: number;
}

export default function TableCell({
  row,
  value,
  header,
  dialog = false,
  editor = false,
  isBoolean,
  readMore = false,
  maxChars = 24,
}: TableCellProps) {
  const isMobile = useIsMobile()

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

  if (editor) {
    const editor = useCreateEditor({
      value: row.getValue('content'),
      readOnly: true,
    })

    const child = (
      <DndProvider backend={HTML5Backend}>
        <Plate
          editor={editor}
          readOnly
        >
          <EditorContainer className="border rounded-md">
            <Editor
              variant={'fullWidth'}
              placeholder="Type..." 
            />
          </EditorContainer>
        </Plate>
      </DndProvider>
    )

    return (
      <>
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                View
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[90vh]">
              <DrawerHeader>
                <DrawerTitle className="text-left">{header}</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 h-full overflow-auto">
                {child}
              </div>
            </DrawerContent>
          </Drawer>
        ): (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                View
              </Button>
            </SheetTrigger>
            <SheetContent side='bottom' className="h-[90vh] flex flex-col gap-3">
              <SheetHeader>
                <SheetTitle>{header}</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-auto">
                {child}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </>
    )
  }

  // Handle readMore parameter for any text content
  if (readMore && typeof cellValue === "string" && cellValue.length > maxChars) {
    return (
      <>
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <div className="flex items-center">
                <span>{cellValue.substring(0, maxChars)}</span>
                <Button variant="ghost" size="sm" className="ml-1 p-0 h-auto text-blue-500 hover:text-blue-700">
                  ...more
                </Button>
              </div>
            </DrawerTrigger>
            <DrawerContent className="p-4 h-[90vh]">
              <DrawerHeader className="text-left px-0">
                <DrawerTitle>{header}</DrawerTitle>
                <div className="px-4 mt-2">
                  <div>{cellValue}</div>
                </div>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex items-center">
                <span>{cellValue.substring(0, maxChars)}</span>
                <Button variant="secondary" size="sm" className="ml-2 p-1 h-auto rounded-sm">
                  ...Read more
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{header}</DialogTitle>
              </DialogHeader>
              <div>{cellValue}</div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return dialog ? (
    <>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              View
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-4 h-[90vh]">
            <DrawerHeader className="text-left px-0">
              <DrawerTitle>{header}</DrawerTitle>
              <div className="px-4">
                <div>{cellValue as string}</div>
              </div>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      ): (
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
      )}
    </>
  ) : (
    <span>{cellValue as string}</span>
  );
}