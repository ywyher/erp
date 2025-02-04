'use client'

import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store";
import { PrescriptionTypes } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Appointment } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PrescriptionProps = { 
    appointmentId: Appointment['id'],
    content: string[],
    context: PrescriptionTypes
};

export default function Prescription({ appointmentId, content, context }: PrescriptionProps) {
  const {
    setLaboratory,
    setMedicine,
    setRadiology,
    laboratory,
    radiology,
    medicine
  } = useConsultationStore(appointmentId);

  // Get the existing prescription value from the store based on the context
  const existingPrescription = 
    context === "laboratory" ? laboratory :
    context === "radiology" ? radiology :
    context === "medicine" ? medicine :
    null;

  // Normalize content: Capitalize first letter & replace underscores
  const normalizeText = (text: string) => 
    text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Initialize the state with the existing prescription value if it exists, otherwise use the content prop
  const [value, setValue] = useState<string>(
    existingPrescription || content.map(normalizeText).join('\n')
  );

  const handleSubmit = () => {
    if (!value) {
      toast.error("Prescription can't be empty");
      return;
    }
    switch (context) {
      case "laboratory":
        setLaboratory(value);
        break;
      case "radiology":
        setRadiology(value);
        break;
      case "medicine":
        setMedicine(value);
        break;
      default:
        break;
    }
    toast.success("Prescription saved successfully!");
  };

  return (
    <div className="w-full">
      <label className="block mb-2 font-semibold capitalize">{context} Prescription</label>
      <div className="flex flex-col gap-2">
        <Textarea
          className="w-full p-2 border rounded-lg resize-none min-h-[150px]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSubmit} // Handle submission when the textarea loses focus
        />
      </div>
    </div>
  );
}