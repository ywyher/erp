import OperationTabs from "@/app/(authenticated)/dashboard/operations/[operationId]/_components/tabs"
import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { getOperationDocument } from "@/lib/db/queries"
import { consultation as consultationTable ,Consultation, Doctor, MedicalFile, Prescription, medicalFile as TMedicalFile, User, operationData, OperationData } from "@/lib/db/schema"
import { medicalFile } from "@/lib/db/schema/medical-file"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const getPatientData = async (operationId: string) => {
    const operation = await db.query.operation.findFirst({
        columns: {
            id: true,
            patientId: true,
            doctorId: true,
            appointmentId: true,
        },
        where: (operation, { eq }) => eq(operation.id, operationId)
    })

    if (!operation) redirect('/dashboard/operations');


    const consultation = operation.appointmentId ? await db.select().from(consultationTable)
      .where(eq(consultationTable.appointmentId, operation.appointmentId))
      : null
    
    const prescriptions = consultation ? await db.query.prescription.findMany({
        where: (prescription, { eq }) => eq(prescription.consultationId, consultation[0].id)
    }) : [];

    const patient = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, operation.patientId)
    })

    const operationDataVar = await db.query.operationData.findFirst({
        where: (operationData, { eq }) => eq(operationData.operationId, operation.id)
    })

    let medicalFiles

    if(operation.appointmentId) {
        medicalFiles = await db.select().from(medicalFile)
            .where(and(eq(medicalFile.patientId, operation.patientId), eq(medicalFile.appointmentId, operation.appointmentId)))
    }

    if (!patient) return;

    return {
        patient,
        doctorId: operation.doctorId,
        medicalFiles: medicalFiles || null,
        consultation: consultation && consultation.length > 0 ? consultation[0] : undefined,
        prescriptions,
        operationData: operationDataVar,
    };
}

export default async function Operation({ params: { operationId } }: { params: { operationId: string } }) {
    const {
         patient,
         medicalFiles,
         doctorId,
         consultation,
         prescriptions,
         operationData,
        } = await getPatientData(operationId) as {
            patient: User;
            doctorId: Doctor['id'];
            medicalFiles: MedicalFile[];
            consultation?: Consultation;
            prescriptions?: Prescription[]
            operationData?: OperationData
        }

    const { data } = await getSession({
        fetchOptions: {
            headers: await headers(),
        },
    });
    
    if(!data || !data.user) {
        return new Error("Couldn't retrieve data")
    }

    let operationDocument;
    if(!operationData?.documentName) {
        operationDocument = await getOperationDocument();

        if(!operationDocument) {
            redirect('/dashboard/operations')
        }
    }else {
        operationDocument = operationData?.documentName
    }

    if(!operationDocument) return new Error("couldnt get operation document")

    return (
        <OperationTabs
            patient={patient}
            medicalFiles={medicalFiles}
            operationId={operationId}
            doctorId={doctorId}
            consultation={consultation}
            prescriptions={prescriptions}
            operationData={operationData}
            operationDocument={operationDocument}
            editable={data.user.role == 'doctor' ? true : false}
        />
    )
}