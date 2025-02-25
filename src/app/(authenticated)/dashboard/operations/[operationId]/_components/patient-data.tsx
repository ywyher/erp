import UserMedicalFiles from "@/app/(authenticated)/dashboard/_components/user-data/medical-files"
import ConsultationData from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/consultation-data"
import PrescriptionTabs from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/prescription-tabs"
import Prescription from "@/components/prescription"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserCard from "@/components/user-card"
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
        {consultation && (
          <TabsTrigger value="consultation">Consultation</TabsTrigger>
        )}
        {consultation && (
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="personal" className="flex flex-col gap-3">
        <UserCard data={patient} />
        {medicalFiles && medicalFiles.length > 0 && (
          <UserMedicalFiles files={medicalFiles} />
        )}
      </TabsContent>
      {consultation && (
        <TabsContent value="consultation">
            <ConsultationData consultation={consultation} />
        </TabsContent>
      )}
      {consultation && (
        <TabsContent value="prescriptions">
            <PrescriptionTabs
              consultation={consultation}
            />
        </TabsContent>
      )}
    </Tabs>
  )
}