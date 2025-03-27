"use client";

import { useAuthStore } from "@/app/(auth)/store";
import { createAppointment } from "@/app/(authenticated)/dashboard/appointments/actions";
import CardLayout from "@/components/card-layout";
import DoctorsList from "@/components/doctors/doctors-list";
import {
  useAppointmentReservationStore,
  useDoctorIdStore,
  useDateStore,
} from "@/components/doctors/store";
import Header from "@/components/header";
import { getSession } from "@/lib/auth-client";
import { User } from "@/lib/db/schema";
import { checkVerificationNeeded } from "@/lib/funcs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Booking() {
  const router = useRouter();
  const setValue = useAuthStore((state) => state.setValue);
  const setContext = useAuthStore((state) => state.setContext);
  const setOperation = useAuthStore((state) => state.setOperation);

  const { data: user, isLoading } = useQuery({
    queryKey: ["session", "booking"],
    queryFn: async () => {
      const { data } = await getSession();
      return (data?.user as User) || null;
    },
  });

  const { setReserved } = useAppointmentReservationStore();
  const { doctorId, setDoctorId } = useDoctorIdStore();
  const { date, setDate } = useDateStore();

  useEffect(() => {
    async function handleCreateAppointment() {
      try {
        if (!doctorId || !date) return;
        if (!user || isLoading) {
          toast.error("Unauthorized, Redirecting to /auth.");
          router.push("/auth");
          return;
        }

        const verificationNeeded = checkVerificationNeeded(user);

        if (verificationNeeded) {
          setValue(verificationNeeded.value);
          setContext(verificationNeeded.type);
          setOperation("verify");
          router.replace("/verify");
          return;
        }

        const createdAppointment = await createAppointment({
          patientId: user.id,
          doctorId: doctorId,
          createdBy: "user",
          status: "pending",
          date,
          creatorId: user.id,
        });

        if (!createdAppointment || createdAppointment?.error) {
          toast.error(createdAppointment?.message);
          setDoctorId(null);
          setDate(null);
          return;
        }

        toast(createdAppointment.message);
        setDoctorId(null);
        setDate(null);
        setReserved({
          reserved: true,
          appointmentId: createdAppointment?.appointmentId,
          patientId: user.id,
        });
        router.push(`/booking/reservation`);
      } catch (err: any) {
        toast.error(err.message);
      }
    }

    if (!isLoading && user && doctorId && date) {
      handleCreateAppointment();
    }
  }, [doctorId, date, user, isLoading]);

  return (
    <>
      <Header />
      <CardLayout title="Book an appointment" className="flex flex-col gap-3">
        <DoctorsList book={true} />
      </CardLayout>
    </>
  );
}
