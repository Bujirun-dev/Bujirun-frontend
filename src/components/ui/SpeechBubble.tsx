import { cn } from "@/shared/utils";

type SpeechBubbleVariant = "white" | "blue";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  bubbleClassName?: string;
  variant?: SpeechBubbleVariant;
  tailPosition?: number; // top/bottom 방향에서 꼬리 x-위치 (px)
  tailCenter?: boolean; // 꼬리를 버블 가운데 정렬
  tailDirection?: "top" | "bottom" | "left" | "right"; // 꼬리 방향 (default: top)
  tailBorderColor?: string; // left/right 꼬리에 border 색상 지정
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
  bubbleClassName,
  variant = "white",
  tailPosition = 20,
  tailCenter = false,
  tailDirection = "top",
  tailBorderColor,
}: SpeechBubbleProps) {
  const { bubble, tailColor, dropShadow } = speechBubbleVariants[variant];
  const isBottom = tailDirection === "bottom";
  const isLeft = tailDirection === "left";
  const isRight = tailDirection === "right";
  const isHorizontal = isLeft || isRight;

  // left/right: 회전 정사각형(다이아몬드) 방식으로 꼬리 렌더링
  if (isHorizontal) {
    return (
      <div
        className={cn("relative", isLeft ? "pl-2" : "pr-2", className)}
        style={{ filter: dropShadow }}
      >
        {/* 다이아몬드 꼬리 - bubble보다 먼저 렌더링되어 뒤에 깔림 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 size-[11px] rotate-45 rounded-[1.5px]"
          style={{
            [isLeft ? "left" : "right"]: 0,
            backgroundColor: tailColor,
            ...(tailBorderColor ? { border: `1px solid ${tailBorderColor}` } : {}),
          }}
        />
        {/* bubble이 나중에 렌더링되어 다이아몬드의 안쪽 절반을 덮음 */}
        <div
          className={cn(
            "relative z-10 px-2.5 py-2 w-fit flex items-center text-xs",
            bubble,
            bubbleClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  // top/bottom: 기존 CSS 삼각형 방식
  const tailStyle: React.CSSProperties = {
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
      <div className={cn("px-2.5 py-2 w-fit flex items-center text-xs", bubble, bubbleClassName)}>
        {children}
      </div>
      <div
        className={cn("absolute w-0 h-0", isBottom ? "bottom-0" : "top-0")}
        style={tailStyle}
      />
    </div>
  );
}
