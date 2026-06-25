interface DayNavigatorProps {
  totalDays: number;
  currentDay: number;
  onDayChange: (day: number) => void;
}

export function DayNavigator({ totalDays, currentDay, onDayChange }: DayNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-5 pt-3 pb-2.5">
      {Array.from({ length: totalDays }).map((_, i) =>
        i === currentDay ? (
          <button
            key={i}
            className="flex size-[22px] items-center justify-center rounded-full bg-main-blue"
            onClick={() => onDayChange(i)}
          >
            <span className="font-proup text-sm font-normal text-white">{i + 1}</span>
          </button>
        ) : (
          <button
            key={i}
            className="size-[9px] rounded-full bg-main-blue/30"
            onClick={() => onDayChange(i)}
          />
        )
      )}
    </div>
  );
}
