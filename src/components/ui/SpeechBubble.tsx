import { cn } from "@/shared/utils";

type SpeechBubbleVariant = "white" | "blue";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  variant?: SpeechBubbleVariant; // white, blue
  tailPosition?: number; // 말풍선 꼬리 x-위치
}

export function SpeechBubble({
  children,
  className,
  variant = "white",
  tailPosition = 20,
}: SpeechBubbleProps) {
  const isBlue = variant === "blue";

  return (
    <div className={cn("relative pt-1.5", className)}>
      <div
        className="absolute top-0 left-5 w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: "6px solid white",
        }}
      />
      <div className="bg-white rounded-lg px-2.5 py-2 w-fit flex items-center text-xs">
        {children}
      </div>
    </div>
  );
}

// 말풍선 본체 - variant별로 분리
const speechBubbleVariants: Record<SpeechBubbleVariant, string> = {
  white: ["bg-main-white", "border-[0.3px]", "border-main-blue", "rounded-[13px]"].join(" "),

  blue: ["bg-system-searchbg", "border-[0.3px]", "border-main-blue", "rounded-[13px]"].join(" "),
};
