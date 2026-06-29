import { cn } from "@/shared/utils";

type SpeechBubbleVariant = "white" | "blue";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  variant?: SpeechBubbleVariant;
  tailPosition?: number; // 말풍선 꼬리 x-위치 (px)
  tailCenter?: boolean; // 꼬리를 버블 가운데 정렬
  tailDirection?: "top" | "bottom"; // 꼬리 방향 (default: top)
}

const speechBubbleVariants: Record<
  SpeechBubbleVariant,
  { bubble: string; tailColor: string; dropShadow: string }
> = {
  white: {
    bubble: "bg-main-white rounded-[13px]",
    tailColor: "white",
    dropShadow: "drop-shadow(0 0 0.4px #97c1ff)",
  },
  blue: {
    bubble: "bg-system-searchbg rounded-[13px]",
    tailColor: "#EAF0FF",
    dropShadow: "drop-shadow(0 0 0.4px #97c1ff)",
  },
};

export function SpeechBubble({
  children,
  className,
  variant = "white",
  tailPosition = 20,
  tailCenter = false,
  tailDirection = "top",
}: SpeechBubbleProps) {
  const { bubble, tailColor, dropShadow } = speechBubbleVariants[variant];
  const isBottom = tailDirection === "bottom";

  const tailStyle = {
    ...(tailCenter ? { left: "50%", transform: "translateX(-50%)" } : { left: tailPosition }),
    ...(isBottom
      ? {
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `6px solid ${tailColor}`,
        }
      : {
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: `6px solid ${tailColor}`,
        }),
  };

  return (
    <div
      className={cn("relative", isBottom ? "pb-1.5" : "pt-1.5", tailCenter && "w-fit", className)}
      style={{ filter: dropShadow }}
    >
      <div className={cn("px-2.5 py-2 w-fit flex items-center text-xs", bubble)}>{children}</div>
      <div className={cn("absolute w-0 h-0", isBottom ? "bottom-0" : "top-0")} style={tailStyle} />
    </div>
  );
}
