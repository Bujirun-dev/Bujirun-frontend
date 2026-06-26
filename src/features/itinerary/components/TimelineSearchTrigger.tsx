import { cn } from "@/shared/utils";

interface TimelineSearchTriggerProps {
  time: string;
  isActive: boolean;
  onOpen: () => void;
}

export function TimelineSearchTrigger({ time, isActive, onOpen }: TimelineSearchTriggerProps) {
  return (
    <>
      <button
        type="button"
        data-time-btn
        className="flex w-10 shrink-0 justify-end pr-2"
        onClick={onOpen}
      >
        {isActive ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-sub-gray p-1">
            <span className="font-paperlogy text-xs font-medium text-sub-gray">{time}</span>
          </div>
        ) : (
          <span className="font-paperlogy text-xs font-medium tracking-[0.6px] text-sub-deepblue">
            {time}
          </span>
        )}
      </button>

      <button
        type="button"
        data-time-btn
        aria-label={`${time} 관광지 검색 열기`}
        onClick={onOpen}
        className="relative z-10 -mx-1.5 flex size-6 shrink-0 items-center justify-center"
      >
        <span
          className={cn("size-3 rounded-full", isActive ? "bg-sub-coral" : "bg-main-blue")}
        />
      </button>
    </>
  );
}
