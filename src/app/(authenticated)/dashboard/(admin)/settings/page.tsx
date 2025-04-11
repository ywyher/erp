import DashboardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import { SettingsSidebar } from "@/app/(authenticated)/dashboard/(admin)/settings/_components/settings-tabs";
import db from "@/lib/db/index";
import { getOperationDocument } from "@/lib/db/queries";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { auth } from "@/lib/auth";

const getCurrentSettings = async () => {
  const { name } = await getOperationDocument({ dbInstance: db });
  return {
    operationDocument: name || "",
  };
};

export default async function Settings() {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (!data) return forbidden();

  const { operationDocument } = await getCurrentSettings();

  return (
    <DashboardLayout>
      <SettingsSidebar
        userId={data.user.id}
        operationDocument={operationDocument}
      />
    </DashboardLayout>
  );
}
