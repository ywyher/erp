import AppointmentChart from "@/app/(authenticated)/dashboard/_components/page/_components/appointment-chart";
import OperationChart from "@/app/(authenticated)/dashboard/_components/page/_components/operation-chart";
import AdminChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/admin-chart";
import DoctorChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/doctor-chart";
import ReceptionistChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/receptionist-chart";
import UserChart from "@/app/(authenticated)/dashboard/_components/page/admin/_components/user-chart";
import Employees from "@/components/employees";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <TabsContent
          value="analysis"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4"
        >
          <UserChart />
          <DoctorChart />
          <ReceptionistChart />
          <AdminChart />
          <OperationChart />
          <AppointmentChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
