"use client";

import { getSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import UploadPfp from "@/components/uploadPfp";
import Header from "@/components/header";
import SettingsForm from "@/app/(authenticated)/settings/_components/settings-form";
import { getUserProvider } from "@/lib/db/queries";
import VerifyAlert from "@/components/verify-alert";
import UpdatePassword from "@/components/update-password";

export default function Settings() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["session", "settings"],
    queryFn: async () => {
      const { data } = await getSession();
      return data?.user || null;
    },
  });

  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      if (!user) return;
      const { provider } = await getUserProvider(user.id);
      return provider;
    },
    enabled: !!user,
  });

  if (isLoading) return;

  return (
    <div>
      <Header />
      <VerifyAlert />
      {user && (
        <div className="
          bg-background
          flex flex-col gap-5 w-full
          p-6 mx-auto 
          sm:p-8 md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]
          shadow-lg 
          rounded-es-2xl rounded-ee-2xl
        ">
          {provider == "credential" ? (
            <Tabs
              defaultValue="settings"
              className="flex flex-col w-full gap-3"
            >
              <TabsList className="w-full">
                <TabsTrigger className="w-full" value="settings">
                  Settings
                </TabsTrigger>
                <TabsTrigger className="w-full" value="password">
                  Password
                </TabsTrigger>
              </TabsList>
              <TabsContent value="settings" className="flex flex-col gap-3">
                <p className="text-2xl font-medium">
                  Update Profile Settings
                </p>
                <UploadPfp />
                <SettingsForm />
              </TabsContent>
              <TabsContent value="password" className="flex flex-col gap-3">
                <p className="text-2xl font-medium">
                  Update Profile Settings
                </p>
                <UpdatePassword userId={user.id} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-medium">
                Update Profile Settings
              </p>
              <UploadPfp />
              <SettingsForm />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
