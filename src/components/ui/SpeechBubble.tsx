import { cn } from "@/shared/utils";

type SpeechBubbleVariant = "white" | "blue";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  bubbleClassName?: string;
  variant?: SpeechBubbleVariant;
  tailPosition?: number;
  tailCenter?: boolean;
  tailDirection?: "top" | "bottom" | "left" | "right";
}

const BORDER_COLOR = "var(--color-main-blue)";

const speechBubbleVariants: Record<SpeechBubbleVariant, { bubble: string; tailFill: string }> = {
  white: {
    bubble: "bg-main-white rounded-[13px] border border-main-blue",
    tailFill: "var(--color-main-white)",
  },
  blue: {
    bubble: "bg-system-searchbg rounded-[13px] border border-main-blue",
    tailFill: "var(--color-system-searchbg)",
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
}: SpeechBubbleProps) {
  const { bubble, tailFill } = speechBubbleVariants[variant];
  const isBottom = tailDirection === "bottom";
  const isLeft = tailDirection === "left";
  const isRight = tailDirection === "right";
  const isHorizontal = isLeft || isRight;

  if (isHorizontal) {
    const side = isLeft ? "right" : "left";
    const borderSide = isLeft ? "borderRight" : "borderLeft";

    const outerTail: React.CSSProperties = {
      [side]: "calc(100% - 1px)",
      top: "50%",
      transform: "translateY(-50%)",
      borderTop: "8px solid transparent",
      borderBottom: "8px solid transparent",
      [borderSide]: `11px solid ${BORDER_COLOR}`,
    };

    const innerTail: React.CSSProperties = {
      [side]: "calc(100% - 1px)",
      top: "50%",
      transform: "translateY(-50%)",
      borderTop: "7px solid transparent",
      borderBottom: "7px solid transparent",
      [borderSide]: `10px solid ${tailFill}`,
    };

    return (
      <div className={cn("relative w-fit", className)}>
        <div className={cn("px-2.5 py-2 w-fit flex items-center text-xs", bubble, bubbleClassName)}>
          {children}
        </div>
        <div className="absolute w-0 h-0" style={outerTail} />
        <div className="absolute w-0 h-0" style={innerTail} />
      </div>
    );
  }

  const outerTailStyle: React.CSSProperties = {
    ...(tailCenter ? { left: "50%", transform: "translateX(-50%)" } : { left: tailPosition }),
    ...(isBottom
      ? {
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: `7px solid ${BORDER_COLOR}`,
        }
      : {
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderBottom: `7px solid ${BORDER_COLOR}`,
        }),
  };

  const innerTailStyle: React.CSSProperties = {
    ...(tailCenter ? { left: "50%", transform: "translateX(-50%)" } : { left: tailPosition + 1 }),
    ...(isBottom
      ? {
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `6px solid ${tailFill}`,
        }
      : {
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: `6px solid ${tailFill}`,
        }),
  };

  return (
    <div className={cn("relative", isBottom ? "pb-2" : "pt-2", tailCenter && "w-fit", className)}>
      <div className={cn("px-2.5 py-2 w-fit flex items-center text-xs", bubble, bubbleClassName)}>
        {children}
      </div>
      <div
        className={cn("absolute w-0 h-0", isBottom ? "bottom-[1px]" : "top-[1px]")}
        style={outerTailStyle}
      />
      <div
        className={cn("absolute w-0 h-0", isBottom ? "bottom-[2px]" : "top-[2px]")}
        style={innerTailStyle}
      />
    </div>
  );
}
