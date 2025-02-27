import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receptionist, Schedule, User } from "@/lib/db/schema";
import Pfp from "@/components/pfp";
import { ScheduleDisplay } from "@/components/schedule-display";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ReceptionistCard = {
  data: {
    user: User;
    receptionist: Receptionist;
    schedules: Schedule[];
  };
};

export function ReceptionistCard({ data }: ReceptionistCard) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-col items-center text-center">
        <Pfp image={data.user.image} className="w-20 h-20 sm:w-24 sm:h-24" />
        <CardTitle className="text-xl mb-1">{data.user.name}</CardTitle>
        <p className="text-sm text-muted-foreground">@{data.user.username}</p>
        <Badge variant="secondary" className="mb-2">
          {data.receptionist.department}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Email:</strong> {data.user.email}
          </p>
          <p className="text-sm">
            <strong>Role:</strong> {data.user.role}
          </p>
          <p className="text-sm">
            <strong>National ID:</strong> {data.user.nationalId}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Select Schedules
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedules</DialogTitle>
              </DialogHeader>
              <ScheduleDisplay
                open={open}
                setOpen={setOpen}
                schedules={data.schedules}
                dialog={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
