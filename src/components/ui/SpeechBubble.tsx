import { cn } from "@/shared/utils";

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
}

export function SpeechBubble({ children, className }: SpeechBubbleProps) {
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
