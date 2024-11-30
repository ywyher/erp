import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@/lib/db/schema'
import Pfp from '@/components/pfp'

export function UserCard({ data }: { data: User }) {
    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="flex flex-col items-center text-center">
                <Pfp image={data.image} className="w-20 h-20 sm:w-24 sm:h-24" />
                <CardTitle className="text-xl mb-1">{data.name}</CardTitle>
                <p className="text-sm text-muted-foreground">@{data.username}</p>
                <Badge variant="secondary" className="mb-2">{data.role}</Badge>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-2">
                    <p className="text-sm"><strong>Email:</strong> {data.email}</p>
                    <p className="text-sm"><strong>Phone:</strong> {data.phoneNumber}</p>
                    <p className="text-sm"><strong>National ID:</strong> {data.nationalId}</p>
                </div>
            </CardContent>
        </Card>
    )
}