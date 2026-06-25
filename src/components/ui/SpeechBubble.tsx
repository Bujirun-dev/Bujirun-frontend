import { cn } from "@/shared/utils";

type SpeechBubbleVariant = "white" | "blue";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  variant?: SpeechBubbleVariant;
  tailPosition?: number; // 말풍선 꼬리 x-위치 (px)
}

const speechBubbleVariants: Record<SpeechBubbleVariant, { bubble: string; tailColor: string }> = {
  white: {
    bubble: "bg-main-white border-[0.3px] border-main-blue rounded-[13px]",
    tailColor: "white",
  },
  blue: {
    bubble: "bg-system-searchbg border-[0.3px] border-main-blue rounded-[13px]",
    tailColor: "#EAF0FF",
  },
};

export function SpeechBubble({
  children,
  className,
  variant = "white",
  tailPosition = 20,
}: SpeechBubbleProps) {
  const { bubble, tailColor } = speechBubbleVariants[variant];

  return (
    <div className={cn("relative pt-1.5", className)}>
      <div
        className="absolute top-0 w-0 h-0"
        style={{
          left: tailPosition,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: `6px solid ${tailColor}`,
        }}
      />
      <div className={cn("px-2.5 py-2 w-fit flex items-center text-xs", bubble)}>
        {children}
      </div>
    </div>
  );
}
