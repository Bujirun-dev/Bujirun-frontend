import type { ItineraryStop } from "./ItineraryTimeline";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { DayNavigator } from "./DayNavigator";

interface SlidingTimelineProps {
  allDayStops: ItineraryStop[][];
  currentDay: number;
  tripDates: string[];
  onAdd: () => void;
  onDayChange: (day: number) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function SlidingTimeline({
  allDayStops,
  currentDay,
  tripDates,
  onAdd,
  onDayChange,
  onTouchStart,
  onTouchEnd,
}: SlidingTimelineProps) {
  return (
    <div className="-ml-6 flex-1 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-300 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${currentDay * 100}%)` }}
      >
        {allDayStops.map((dayStops, dayIdx) => (
          <div
            key={dayIdx}
            className="box-border w-full min-w-0 h-full shrink-0 overflow-y-auto pl-3 pr-1 pb-6"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <ItineraryTimeline stops={dayStops} date={tripDates[dayIdx]} onAdd={onAdd} />
            <DayNavigator
              totalDays={allDayStops.length}
              currentDay={currentDay}
              onDayChange={onDayChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
