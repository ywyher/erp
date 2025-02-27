"use client";

import ScheduleSelector from "@/app/(authenticated)/dashboard/_components/schedule-selector";
import { updateSchedule } from "@/app/(authenticated)/dashboard/actions";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import LoadingBtn from "@/components/loading-btn";
import { User } from "@/lib/auth-client";
import { getUserById } from "@/lib/db/queries";
import { Schedule } from "@/lib/db/schema";
import { groupSchedules, transformSchedulesToRecords } from "@/lib/funcs";
import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function UpdateSchedule({
  userId,
  setOpen,
}: {
  userId: string;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: user, isLoading: isPending } = useQuery({
    queryKey: ["userById", userId],
    queryFn: async () => {
      const data = await getUserById(userId, "doctor");
      return data as { user: User; schedules: Schedule[] };
    },
  });

  const schedules = useMemo(
    () => groupSchedules(user?.schedules || []),
    [user],
  );
  const selectedDays = useMemo(() => Object.keys(schedules), [schedules]);

  const [updatedSchedules, setUpdatedSchedules] = useState<Schedules>({});
  const [updatedDays, setUpdatedDays] = useState<string[]>([]);

  useEffect(() => {
    setUpdatedSchedules(schedules);
    setUpdatedDays(selectedDays);
  }, [schedules, selectedDays]);

  // strips schedules id/createdAt/updatedAt allowing the comprasion to work properly
  const stripSchedules = (schedules: Schedule[]) =>
    schedules.map(({ id, createdAt, updatedAt, ...rest }) => rest);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("User data not available");

      if (updatedDays.length === 0) {
        toast.error("Schedule is required");
        return;
      }

      const missingSchedules = updatedDays.filter(
        (day) => !updatedSchedules[day]?.length,
      );
      if (missingSchedules.length > 0) {
        toast.error(
          `The following days are missing schedules: ${missingSchedules.join(", ")}`,
        );
        return;
      }

      const newSchedules = transformSchedulesToRecords(
        updatedSchedules,
        userId,
      );

      // Normalize both sets of schedules before comparing
      const normalizedOldSchedules = stripSchedules(user.schedules);
      const normalizedNewSchedules = stripSchedules(newSchedules);

      if (
        JSON.stringify(normalizedOldSchedules) ===
        JSON.stringify(normalizedNewSchedules)
      ) {
        toast.error(
          "The schedules are the same as the current ones. No updates needed.",
        );
        return;
      }

      const result = await updateSchedule({
        schedules: updatedSchedules,
        userId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.message(result.message);
      // if (setOpen) setOpen(false)
    } catch (error) {
      toast.error("An error occurred while updating the schedule.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <ScheduleSelector
        schedules={updatedSchedules}
        setSchedules={setUpdatedSchedules}
        selectedDays={updatedDays}
        setSelectedDays={setUpdatedDays}
      />
      <div className="mt-4">
        <LoadingBtn isLoading={isLoading} onClick={onSubmit}>
          Update
        </LoadingBtn>
      </div>
    </div>
  );
}
