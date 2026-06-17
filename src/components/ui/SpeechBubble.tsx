import { cn } from "@/shared/utils";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
}

export function SpeechBubble({ children, className }: SpeechBubbleProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute -top-[6px] left-5 w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: "6px solid white",
        }}
      />
      <div className="bg-white rounded-[14px] px-4 py-3">
        {children}
      </div>
    </div>
  );
}
