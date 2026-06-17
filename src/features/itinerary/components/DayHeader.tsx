import { cn } from "@/shared/utils";

interface DayHeaderProps {
  day: number;
  date: string;
  onMapPress?: () => void;
  onAIPress?: () => void;
  onListPress?: () => void;
  className?: string;
}

export function DayHeader({
  day,
  date,
  onMapPress,
  onAIPress,
  onListPress,
  className,
}: DayHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <div className="flex items-center gap-2">
        <span className="bg-main-blue text-main-white font-paperlogy font-bold text-[13px] px-3 py-1 rounded-full">
          day {day}
        </span>
        <span className="font-paperlogy text-[13px] text-text-primary">{date}</span>
      </div>

      <div className="flex items-center gap-2">
        {onMapPress && (
          <button
            onClick={onMapPress}
            className="w-[32px] h-[32px] rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            <span className="text-[16px]">🗺</span>
          </button>
        )}
        {onAIPress && (
          <button
            onClick={onAIPress}
            className="w-[32px] h-[32px] rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            <span className="text-[16px]">✨</span>
          </button>
        )}
        {onListPress && (
          <button
            onClick={onListPress}
            className="w-[32px] h-[32px] rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            <span className="text-[16px]">📋</span>
          </button>
        )}
      </div>
    </div>
  );
}
