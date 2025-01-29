import { useConsultationStore } from "@/app/(authenticated)/dashboard/appointments/[appointmentId]/store"
import { Appointment } from "@/lib/db/schema";

export default function Prescriptions({ appointmentId }: { appointmentId: Appointment['id'] }) {

  const {
    laboratories,
    medicines,
    radiologies,
    setLaboratories,
    setMedicines,
    setRadiologies
  } = useConsultationStore(appointmentId)

  if(!laboratories && !medicines && !radiologies) return;

  return (
    <>
      <pre>
        Laboratories: 
          <p className="text-red-500">{JSON.stringify(laboratories, null, 2)}</p>
      </pre>
      <br />
      <br />
      <pre>
        Radiologoes:
          <p className="text-red-500">{JSON.stringify(radiologies, null, 2)}</p>
      </pre>
      <br />
      <br />
      <pre>
        Medicines:
          <p className="text-red-500">{JSON.stringify(medicines, null, 2)}</p>
      </pre>
    </>
  )
}