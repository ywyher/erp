import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/funcs";

export default function Pfp({
  image,
  className,
}: {
  image?: string;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={getFileUrl(image as string)}
        alt="Profile picture"
        onError={(e) =>{ 
          e.currentTarget.src = "/images/pfp.jpg";
        }}
      />
      <AvatarFallback>AS</AvatarFallback>
    </Avatar>
  );
}
