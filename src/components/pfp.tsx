import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function Pfp({ image }: { image: string | undefined }) {

    const getImage = () => {
        if (image == 'pfp.jpg') {
            return `/images/${image}`
        }
        if (image?.includes('https') || image?.includes('http')) {
            return image
        } else {
            return `${process.env.NEXT_PUBLIC_R2_DEV_URL}` + image
        }
    }

    return (
        <div>
            <Avatar>
                <AvatarImage src={getImage()} />
                <AvatarFallback>AS</AvatarFallback>
            </Avatar>
        </div>
    );
}
