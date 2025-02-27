"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleDisplay } from "@/components/schedule-display";
import CustomDate from "@/components/custom-date";
import { Schedule } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";

export default function DateSelector({
  open,
  onOpenChange,
  setDate,
  trigger,
  schedules,
  tab,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  setDate: (date: Date | null) => void;
  trigger?: string;
  schedules?: Schedule[];
  tab?: "official" | "custom"; // Ensuring tab can only be "official" or "custom"
}) {
  const [selectedTab, setSelectedTab] = useState<"official" | "custom">(
    "custom",
  );

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      setSelectedTab("official");
    }
  }, [tab, schedules]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          <Button>{trigger}</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedTab == "official" ? "Schedules" : "Date"}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue={selectedTab}
          onValueChange={(val) => setSelectedTab(val as typeof selectedTab)}
        >
          <TabsList>
            {schedules && schedules.length > 0 && (
              <TabsTrigger value="official">Official</TabsTrigger>
            )}
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          <TabsContent value="official">
            {schedules && schedules.length > 0 && (
              <ScheduleDisplay
                onClick={(e) => setDate(e)}
                dialog={false}
                schedules={schedules}
              />
            )}
          </TabsContent>
          <TabsContent value="custom">
            <CustomDate onClick={(e) => setDate(e)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
