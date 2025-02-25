import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@/lib/db/schema'
import Pfp from '@/components/pfp'

export default function UserCard({ data }: { data: User }) {
    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="flex flex-row gap-4 items-center text-center">
                <Pfp image={data.image} className="w-20 h-20 sm:w-24 sm:h-24" />
                <div className='flex flex-col gap-2'>
                    <CardTitle className="text-xl capitalize">{data.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">@{data.username}</p>
                    <Badge variant="secondary">{data.role}</Badge>
                </div>
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