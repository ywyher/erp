import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Optional() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="text-sm text-muted-foreground cursor-pointer">
          (Optional)
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>This field is optional</p>
      </TooltipContent>
    </Tooltip>
  );
}
