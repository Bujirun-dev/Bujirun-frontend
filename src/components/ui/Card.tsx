import { cn } from "@/shared/utils";

type CardVariant = "glass-lg" | "glass-sm" | "white";

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ variant = "glass-lg", className, children }: CardProps) {
  return (
    <div className={cn(cardVariants[variant], className)}>
      {children}
    </div>
  );
}

const cardVariants: Record<CardVariant, string> = {
  "glass-lg": [
    "backdrop-blur-[15px]",
    "bg-gradient-to-b from-[rgba(255,255,255,0.52)] to-[rgba(234,244,255,0.39)]",
    "border border-[rgba(255,255,255,0.4)]",
    "rounded-[30px]",
    "opacity-[0.97]",
  ].join(" "),

  "glass-sm": [
    "backdrop-blur-[15px]",
    "bg-gradient-to-b from-[rgba(255,255,255,0.52)] to-[rgba(234,244,255,0.39)]",
    "border border-[rgba(151,193,255,0.2)]",
    "rounded-[20px]",
    "opacity-[0.97]",
  ].join(" "),

  "white": [
    "bg-white",
    "rounded-[15px]",
    "shadow-sm",
  ].join(" "),
};
