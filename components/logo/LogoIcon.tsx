import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "gradient" | "amber" | "white" | "black";
  className?: string;
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 36,
  lg: 60,
  xl: 96,
};

export default function LogoIcon({ 
  size = "md", 
  variant = "gradient",
  className 
}: LogoIconProps) {
  const getImageSrc = () => {
    switch (variant) {
      case "gradient":
        return "/logos/logo-icon-gradient.png";
      case "amber":
        return "/logos/logo-icon-amber.png";
      case "white":
        return "/logos/logo-icon-white.png";
      case "black":
        return "/logos/logo-icon-black.png";
      default:
        return "/logos/logo-icon-gradient.png";
    }
  };

  const dimension = sizeMap[size];

  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src={getImageSrc()}
        alt="HeyAgent Icon"
        width={dimension}
        height={dimension}
        className="object-contain"
      />
    </div>
  );
}