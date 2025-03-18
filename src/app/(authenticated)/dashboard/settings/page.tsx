import CardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";
import { SettingsSidebar } from "@/app/(authenticated)/dashboard/settings/_components/settings-tabs";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db";
import { getOperationDocument } from "@/lib/db/queries";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";

const getCurrentSettings = async () => {
  const { name } = await getOperationDocument({ dbInstance: db });
  return {
    operationDocument: name || "",
  };
};

export default async function Settings() {
  const { data } = await getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data) return forbidden();

  const { operationDocument } = await getCurrentSettings();

  return (
    <CardLayout>
      <SettingsSidebar
        userId={data.user.id}
        operationDocument={operationDocument}
      />
    </CardLayout>
  );
}
