import AppointmentChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/appointment-chart";
import OperationChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/operation-charts";
import RolesChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/roles-chart";
import Employees from "@/components/employees";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function AdminPage() {
  return (
    <div className="p-4">
      <Tabs defaultValue="overall" className="flex flex-col gap-3">
          <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="overall">
            <Employees />
          </TabsContent>
          <TabsContent value="analysis" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
            <RolesChart />
            <OperationChart />
            <AppointmentChart />
          </TabsContent>
      </Tabs>
    </div>
  );
}
