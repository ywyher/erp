import UserMedicalFiles from "@/app/(authenticated)/dashboard/_components/user-data/medical-files"
import UserData from "@/app/(authenticated)/dashboard/_components/user-data/user-data"
import ConsultationData from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/consultation-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Consultation, MedicalFile, User } from "@/lib/db/schema"

type PatientData = {
  patient: User;
  medicalFiles?: MedicalFile[];
  consultation?: Consultation;
}

export default function PatientData({
  patient,
  medicalFiles,
  consultation
}: PatientData) {

  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">Patient's Personal data</TabsTrigger>
        <TabsTrigger value="consulation">Consulation</TabsTrigger>
        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <UserData user={patient} />
        {medicalFiles && medicalFiles.length > 0 && (
          <UserMedicalFiles files={medicalFiles} />
        )}
      </TabsContent>
      <TabsContent value="consulation">
        {consultation && (
          <ConsultationData consultation={consultation} />
        )}
      </TabsContent>
      <TabsContent value="prescriptions">
        {consultation && (
          <ConsultationData consultation={consultation} />
        )}
      </TabsContent>
    </Tabs>
  )
}