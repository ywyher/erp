"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUserById, getWorkerUserId } from "@/lib/db/queries";
import { Roles } from "@/app/types";
import UserCard from "@/components/user-card";
import { DoctorCard } from "@/components/doctors/doctor-card";
import { Eye } from "lucide-react";
import { Doctor, Schedule, User } from "@/lib/db/schema";

export default function UserDataDialog({
  userId,
  role,
}: {
  userId: string;
  role: Roles;
}) {
  const [userData, setUserData] = useState<User | { user: User, doctor: Doctor, schedules: Schedule[] } | null>();

  const fetchUserData = async () => {
    if (role == "user") {
      const data = await getUserById(userId, role);
      setUserData(data as User);
    } else if (role == "doctor") {
      const mainUserId = await getWorkerUserId(userId, "doctor");

      if (!mainUserId) return;

      const data = await getUserById(mainUserId, role);
      setUserData(data as { user: User, doctor: Doctor, schedules: Schedule[] });
    }

  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={fetchUserData}>
          <Eye size={20} />
          See Data
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="idk">
        <DialogHeader>
          <DialogTitle>
            {role.charAt(0).toUpperCase() + role.slice(1)} Data
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {userData ? (
          <div>
            {(role == "user" || role == "admin") ? (
              <UserCard data={userData as User} />
            ) : (
              <DoctorCard data={userData as { user: User, doctor: Doctor, schedules: Schedule[] }} />
            )}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
