'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doctor, Schedule, User } from "@/lib/db/schema";
import Pfp from "@/components/pfp";
import { ScheduleDisplay } from "@/components/schedule-display";
import { useDoctorIdStore, useDateStore } from "@/components/doctors/store";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomDate from "@/components/custom-date";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { getSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type DoctorCard = {
  data: {
    user: User;
    doctor: Doctor;
    schedules: Schedule[];
  };
  book?: boolean;
  customSchedule?: boolean;
};

export function DoctorCard({
  data,
  book = false,
  customSchedule = false,
}: DoctorCard) {
  const [open, setOpen] = useState<boolean>(false);
  const { setDoctorId } = useDoctorIdStore();
  const { setDate } = useDateStore();

  const router = useRouter()
  const isMobile = useIsMobile();

  const handleBookDoctor = async (date: Date) => {
    const session = await getSession()

    if(!session.data) {
      toast.error("You must be authenticated", {
        action: {
          label: "Authenticate ?",
          onClick: () => router.push('/auth')
        }
      })
    }

    setDoctorId(data.doctor.id);
    setDate(date);
    setOpen(false);
  };

  const customScheduleContent = (
    <Tabs defaultValue="custom">
      <TabsList>
        <TabsTrigger value="offical">Offical</TabsTrigger>
        <TabsTrigger value="custom">Custom</TabsTrigger>
      </TabsList>
      <TabsContent value="offical" className="pt-3">
        <ScheduleDisplay
          open={open}
          setOpen={setOpen}
          schedules={data.schedules}
          onClick={(e) => handleBookDoctor(e)}
          dialog={false}
        />
      </TabsContent>
      <TabsContent value="custom" className="pt-3">
        <CustomDate onClick={(e) => handleBookDoctor(e)} />
      </TabsContent>
    </Tabs>
  )

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-col items-center text-center">
        <Pfp image={data.user.image} className="w-20 h-20 sm:w-24 sm:h-24" />
        <CardTitle className="text-xl">{data.user.name}</CardTitle>
        <p className="text-sm text-muted-foreground">@{data.user.username}</p>
        <div className="flex flex-row flex-wrap gap-2 items-center capitalize">
          <Badge variant="secondary">
            {data.doctor.specialty}
          </Badge>
          <Badge variant="secondary">
            {data.user.role}
          </Badge>
        </div>
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
          {book ? (
            customSchedule ? (
              <>
                {isMobile ? (
                  <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Select Schedules
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="flex flex-col h-[90vh]">
                      <DrawerHeader className="text-left px-8 pt-5">
                        <DrawerTitle>Scheudles</DrawerTitle>
                      </DrawerHeader>
                      <div className="px-8 pt-3">
                        {customScheduleContent}
                      </div>
                    </DrawerContent>
                  </Drawer>
                ): (
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
                      {customScheduleContent}
                    </DialogContent>
                  </Dialog>
                )}
              </>
            ) : (
              <ScheduleDisplay
                open={open}
                setOpen={setOpen}
                schedules={data.schedules}
                onClick={(e) => handleBookDoctor(e)}
              />
            )
          ) : (
            <ScheduleDisplay
              open={open}
              setOpen={setOpen}
              schedules={data.schedules}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
