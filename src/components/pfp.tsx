import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Pfp({ image, className }: { image?: string, className?: string }) {

    const getImage = () => {
        if (image == 'pfp.jpg') {
            return `/images/${image}`
        }
        if (image?.includes('https') || image?.includes('http')) {
            return image
        } else {
            return `${process.env.NEXT_PUBLIC_S3_DEV_URL}` + image
        }
    }

    return (
        <Avatar className={className}>
            <AvatarImage src={getImage()} alt="Profile picture" />
            <AvatarFallback>AS</AvatarFallback>
        </Avatar>
    );
}