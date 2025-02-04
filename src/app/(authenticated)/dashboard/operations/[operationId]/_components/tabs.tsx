import { Consultation, Doctor, MedicalFile, Operation, Prescription, User } from "@/lib/db/schema"

type OperationTabs = {
  user: User;
  operationId: Operation['id'];
  doctorId: Doctor['id'];
  medicalFiles?: MedicalFile[];
  consultation?: Consultation;
  prescriptions?: Prescription[]
}

export default function OperationTabs({
  user,
  operationId,
  doctorId,
  medicalFiles,
  consultation,
  prescriptions,
}: OperationTabs) {
  return (
    <>
    
    </>
  )
}