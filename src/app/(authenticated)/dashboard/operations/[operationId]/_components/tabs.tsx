import OperationData from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/operation-data";
import PatientData from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/patient-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Consultation, Doctor, MedicalFile, Operation, Prescription, User } from "@/lib/db/schema"

type OperationTabs = {
  patient: User;
  operationId: Operation['id'];
  doctorId: Doctor['id'];
  medicalFiles?: MedicalFile[];
  consultation?: Consultation;
  prescriptions?: Prescription[]
}

export default function OperationTabs({
  patient,
  operationId,
  doctorId,
  medicalFiles,
  consultation,
  prescriptions,
}: OperationTabs) {
  return (
    <>
    <Tabs defaultValue="operation-data" className="w-full">
      <TabsList>
        <TabsTrigger value="patient-data">Patient's data</TabsTrigger>
        <TabsTrigger value="operation-data">Operation data</TabsTrigger>
      </TabsList>
      <TabsContent value="patient-data">
        <PatientData
          patient={patient}
          medicalFiles={medicalFiles}
          consultation={consultation}
        />
      </TabsContent>
      <TabsContent value="operation-data">
        <OperationData
          operationId={operationId}
        />
      </TabsContent>
    </Tabs>
    </>
  )
}