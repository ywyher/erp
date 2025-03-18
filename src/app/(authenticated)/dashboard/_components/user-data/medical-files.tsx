import type { MedicalFile, medicalFile } from "@/lib/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Images from "./images";
import Videos from "./videos";
import Pdfs from "./pdfs";
import CardLayout from "@/app/(authenticated)/dashboard/_components/dashboard-layout";

export default function UserMedicalFiles({ files }: { files: MedicalFile[] }) {
  const hasImages = files.some((file) => file.type.startsWith("image/"));
  const hasVideos = files.some((file) => file.type.startsWith("video/"));
  const hasPdfs = files.some((file) => file.type === "application/pdf");

  const tabs = [
    {
      value: "images",
      label: "Images",
      condition: hasImages,
      component: Images,
    },
    {
      value: "videos",
      label: "Videos",
      condition: hasVideos,
      component: Videos,
    },
    { value: "pdfs", label: "PDFs", condition: hasPdfs, component: Pdfs },
  ].filter((tab) => tab.condition);

  if (tabs.length === 0) {
    return;
  }

  return (
    <CardLayout title="User Medical Files" className="m-0 p-0">
      <Tabs defaultValue={tabs[0].value}>
        <TabsList className={``}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <tab.component files={files} />
          </TabsContent>
        ))}
      </Tabs>
    </CardLayout>
  );
}
