import { cn } from "@/lib/utils";
import LogoIcon from "./LogoIcon";

interface LogoFullProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "auto";
  iconVariant?: "gradient" | "amber" | "white" | "black";
  className?: string;
}

const sizeClasses = {
  xs: {
    icon: "xs" as const,
    text: "text-sm",
    spacing: "space-x-1",
  },
  sm: {
    icon: "sm" as const,
    text: "text-xl",
    spacing: "space-x-1",
  },
  md: {
    icon: "md" as const,
    text: "text-3xl",
    spacing: "space-x-2",
  },
  lg: {
    icon: "lg" as const,
    text: "text-5xl",
    spacing: "space-x-3",
  },
  xl: {
    icon: "xl" as const,
    text: "text-7xl",
    spacing: "space-x-4",
  },
};

export default function LogoFull({ 
  size = "md", 
  variant = "auto",
  iconVariant = "gradient",
  className 
}: LogoFullProps) {
  const getTextColorClass = () => {
    switch (variant) {
      case "light":
        return "text-slate-900";
      case "dark":
        return "text-white";
      case "auto":
        return "text-slate-900 dark:text-white";
      default:
        return "";
    }
  };

  const config = sizeClasses[size];

  return (
    <div className={cn("flex items-center", config.spacing, className)}>
      <LogoIcon size={config.icon} variant={iconVariant} />
      <span 
        className={cn(
          "font-bold tracking-tight",
          config.text,
          getTextColorClass()
        )}
        style={{ fontFamily: 'var(--font-figtree)' }}
      >
        HEYAGENT
      </span>
    </div>
  );
}