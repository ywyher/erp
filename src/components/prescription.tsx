'use client'

import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store";
import { PrescriptionTypes } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/types";
import { Textarea } from "@/components/ui/textarea";
import { Appointment } from "@/lib/db/schema";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type PrescriptionProps = { 
    appointmentId?: Appointment['id'],
    content: string[],
    context: PrescriptionTypes,
    editable: boolean
};

export default function Prescription({
   appointmentId,
   content,
   context,
   editable
}: PrescriptionProps) {
  
  const consultationStore = appointmentId ? useConsultationStore(appointmentId) : null;
  
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef });

  // Get the existing prescription value from the store based on the context if appointmentId exists
  const existingPrescription = appointmentId ? (
    context === "laboratory" ? consultationStore?.laboratory :
    context === "radiology" ? consultationStore?.radiology :
    context === "medicine" ? consultationStore?.medicine :
    null
  ) : null;

  // Normalize content: Capitalize first letter & replace underscores
  const normalizeText = (text: string) => 
    text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Initialize the state with the existing prescription value if available, otherwise use the content prop
  const [value, setValue] = useState<string>(
    existingPrescription || content.map(normalizeText).join('\n')
  );

  const handleSubmit = () => {
    if (!value) {
      toast.error("Prescription can't be empty");
      return;
    }
    if (!appointmentId) return;

    switch (context) {
      case "laboratory":
        consultationStore?.setLaboratory(value);
        break;
      case "radiology":
        consultationStore?.setRadiology(value);
        break;
      case "medicine":
        consultationStore?.setMedicine(value);
        break;
      default:
        break;
    }
    toast.success("Prescription saved successfully!");
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="font-semibold capitalize">{context} Prescription</label>
        <Button variant="outline" size="sm" onClick={() => handlePrint()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
      <div ref={contentRef} className="flex flex-col gap-2">
        <Textarea
          className="w-full p-2 border rounded-lg resize-none min-h-[150px]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!editable}
          onBlur={() => {
            if (editable) {
              handleSubmit();
            }
          }}
        />
      </div>
    </div>
  );
}