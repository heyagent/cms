import { cn } from "@/lib/utils";

interface LogoIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "gradient" | "amber" | "white" | "black";
  className?: string;
}

const sizeClasses = {
  xs: "text-base",    // 16px
  sm: "text-2xl",     // 24px
  md: "text-4xl",     // 36px
  lg: "text-6xl",     // 60px
  xl: "text-8xl",     // 96px
};

export default function LogoIcon({ 
  size = "md", 
  variant = "gradient",
  className 
}: LogoIconProps) {
  const getColorClass = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-r from-amber-400 to-fuchsia-600 text-transparent bg-clip-text";
      case "amber":
        return "text-amber-400";
      case "white":
        return "text-white";
      case "black":
        return "text-slate-900";
      default:
        return "";
    }
  };

  return (
    <span 
      className={cn(
        "font-bold inline-block",
        sizeClasses[size],
        getColorClass(),
        className
      )}
    >
      ✳
    </span>
  );
}