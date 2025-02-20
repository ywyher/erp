'use client'

import Prescription from "@/components/prescription"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Consultation } from "@/lib/db/schema"

type PrescriptionTabs = {
  consultation: Consultation
}

export default function PrescriptionTabs({ consultation }: PrescriptionTabs) {
  const tabs = [
    { key: "laboratory", label: "Laboratory", data: consultation.laboratories ? consultation.laboratories.split(',') : [] },
    { key: "medicine", label: "Medicine", data: consultation.medicines ? consultation.medicines.split(',') : [] },
    { key: "radiology", label: "Radiology", data: consultation.radiologies ? consultation.radiologies.split(',') : [] },
  ].filter((tab) => tab.data && tab.data.length > 0)

  return (
    <Tabs defaultValue={tabs[0].key}>
      <TabsList>
       {tabs.map(({ key, label }) => (
          <TabsTrigger key={key} value={key} className="w-full">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ key, data }) => (
        <TabsContent key={key} value={key}>
          <Prescription
            context={key as "laboratory" | "medicine" | "radiology"}
            content={data as string[]}
            editable={false}
          />
        </TabsContent>
      ))}
  </Tabs>
  )
}