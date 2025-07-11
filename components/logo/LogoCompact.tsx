import { cn } from "@/lib/utils";
import LogoIcon from "./LogoIcon";

interface LogoCompactProps {
  showText?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function LogoCompact({ 
  showText = true, 
  size = "md",
  className 
}: LogoCompactProps) {
  const iconSize = size === "sm" ? "sm" : "md";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={cn("flex items-center", size === "sm" ? "space-x-1" : "space-x-2", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-fuchsia-600",
        size === "sm" ? "w-6 h-6" : "w-8 h-8"
      )}>
        <LogoIcon size={iconSize} variant="white" />
      </div>
      {showText && (
        <div className="grid flex-1 text-left leading-tight">
          <span className={cn("truncate font-semibold", textSize)}>HeyAgent</span>
          <span className={cn("truncate", size === "sm" ? "text-[10px]" : "text-xs", "text-muted-foreground")}>
            Admin Panel
          </span>
        </div>
      )}
    </div>
  );
}