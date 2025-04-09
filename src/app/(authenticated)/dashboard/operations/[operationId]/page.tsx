import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import OperationTabs from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/operation-tabs";
import { getDoctorData, getPatientData } from "@/app/(authenticated)/dashboard/operations/[operationId]/actions";
import { getSession } from "@/lib/auth-client";
import { getOperationDocument } from "@/lib/db/queries";
import { Consultation, MedicalFile, Operation as TOperation, OperationData, User } from "@/lib/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Params = Promise<{ operationId: TOperation['id'] }>

export default async function Operation({
  params,
}: {
  params: Params
}) {
  const { operationId } = await params;

  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data || !data.user) {
    return new Error("Couldn't retrieve data");
  }
  const doctor = await getDoctorData({ userId: data?.user.id })

  const { patient, medicalFiles, consultation, operationData } =
    (await getPatientData(operationId)) as {
      patient: User;
      medicalFiles: MedicalFile[];
      consultation?: Consultation;
      operationData?: OperationData;
    };


  let operationDocument: { name: string; error: string | null };
  if (!operationData?.documentName) {
    operationDocument = (await getOperationDocument({})) as {
      name: string;
      error: string | null;
    };

    if (!operationDocument) {
      redirect(
        "/dashboard/operations?error=Missing%20operation%20document%20contact%20the%20admin.",
      );
    }
  } else {
    operationDocument = { name: operationData?.documentName, error: null };
  }

  if (!operationDocument) return new Error("couldnt get operation document");

  return (
    <DashboardLayout>
      <OperationTabs
        patient={patient}
        doctorId={doctor.id}
        medicalFiles={medicalFiles}
        operationId={operationId}
        consultation={consultation}
        operationData={operationData}
        operationDocument={operationDocument.name}
        editable={data.user.role == "doctor" ? true : false}
      />
    </DashboardLayout>
  );
}
