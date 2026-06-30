import { SAMPLE_LOGS } from "@/features/home/data/sampleLogs";
import { StatusBadge } from "@/components";

interface TodayItineraryProps {
  logIndex?: number;
  dayIndex?: number;
}

export function TodayItinerary({ logIndex = 0, dayIndex = 0 }: TodayItineraryProps) {
  const log = SAMPLE_LOGS[logIndex];
  const day = log.days[dayIndex];
  const plans = day.stops;
  return (
    <div>
      <div className="flex items-end gap-3">
        <h2 className="font-ssurround text-xl text-text-heading">오늘의 일정</h2>
        <p className="font-paperlogy text-sm font-semibold text-sub-darkgray">{day.date}</p>
      </div>

      <ol className="mt-6 space-y-4">
        {plans.map((plan, index) => (
          <li
            key={`${plan.time}-${plan.place}`}
            className="relative flex items-start justify-between gap-4"
          >
            {index < plans.length - 1 && (
              <span
                className="absolute left-[7.5px] top-[30px] bottom-[-15px] w-px bg-sub-gray"
                aria-hidden="true"
              />
            )}

            <div className="flex min-w-0 flex-1 items-start gap-3 pt-[7px]">
              <span
                className={
                  plan.isVerified
                    ? "size-4 shrink-0 rounded-full bg-main-blue"
                    : "size-4 shrink-0 rounded-full bg-sub-pink"
                }
              />

              <div className="min-w-0 flex-1">
                <p className="leading-4 text-lg font-medium text-text-primary">{plan.place}</p>

                {index < plans.length - 1 && (
                  <div className="mt-3 flex h-[40px] items-center gap-3 rounded-[14px] border-[0.5px] border-main-blue bg-system-navbg px-4 text-md font-medium text-sub-darkgray">
                    <span aria-hidden="true">🚌</span>
                    <span aria-hidden="true">🚇</span>
                    <span>30분 · 1,500원</span>
                  </div>
                )}
              </div>
            </div>

            <StatusBadge
              status={plan.isVerified ? "completed" : "verify"}
              className="shrink-0 px-3 py-2 text-md"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
