import ReservationAttatchFiles from "@/app/booking/reservation/_components/reservation-attatch-files";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReservationNotes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes for doctor</CardTitle>
      </CardHeader>
      <CardContent>
        <ReservationAttatchFiles />
      </CardContent>
    </Card>
  );
}
