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
    <div className={cn("relative pt-[6px]", className)}>
      {/* 말풍선 꼬리 */}
      <>
        {/* 바깥쪽 삼각형 -> 테두리 */}
        <div
          className="absolute top-0 z-10"
          style={{
            left: tailPosition,
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: "7px solid var(--color-main-blue)",
          }}
        />

        {/* 안쪽 삼각형 -> 배경색 */}
        <div
          className="absolute z-20"
          style={{
            top: "1px",
            left: tailPosition,
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderBottom: `6px solid ${isBlue ? "var(--color-system-searchbg)" : "var(--color-main-white)"}`,
          }}
        />
      </>

      {/* 말풍선 본체 */}
      <div
        className={cn(
          "relative z-10 px-5 py-2 w-fit flex items-center text-xs",
          speechBubbleVariants[variant],
        )}
      >
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
