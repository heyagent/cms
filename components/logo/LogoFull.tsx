import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoFullProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "auto";
  className?: string;
}

const sizeMap = {
  xs: { width: 80, height: 20 },
  sm: { width: 120, height: 30 },
  md: { width: 150, height: 40 },
  lg: { width: 200, height: 50 },
  xl: { width: 250, height: 60 },
};

export default function LogoFull({ 
  size = "md", 
  variant = "auto",
  className 
}: LogoFullProps) {
  const dimensions = sizeMap[size];

  if (variant === "auto") {
    return (
      <div className={cn("relative inline-block", className)}>
        <Image
          src="/logos/logo-full-light.png"
          alt="HeyAgent"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain dark:hidden"
        />
        <Image
          src="/logos/logo-full-dark.png"
          alt="HeyAgent"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain hidden dark:block"
        />
      </div>
    );
  }

  const imageSrc = variant === "dark" ? "/logos/logo-full-dark.png" : "/logos/logo-full-light.png";

  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src={imageSrc}
        alt="HeyAgent"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
      />
    </div>
  );
}