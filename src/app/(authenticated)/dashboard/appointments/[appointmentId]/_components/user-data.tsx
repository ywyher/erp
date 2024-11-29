import { User } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, Mail, Phone, CreditCard } from 'lucide-react';
import Pfp from "@/components/pfp";

export default function UserData({ user }: { user: User }) {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
                <Pfp image={user.image} />
                <div className="flex-grow">
                    <CardTitle>{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.phoneNumber || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.nationalId || "Not provided"}</span>
                </div>
            </CardContent>
        </Card>
    );
}
