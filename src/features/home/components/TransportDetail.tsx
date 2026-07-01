import type { Transport } from "@/features/home/data/sampleTransport";
import { cn } from "@/shared/utils";
import { TransportIcon, type TransportType } from "@/features/home/components/TransportIcons";
import { TransportLegItem } from "@/features/home/components/TransportLegItem";

export interface TransportStep {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
  arrivalText?: string;
}

interface TransportDetailProps {
  transport: Transport;
}

const TRANSPORT_COLORS: Record<TransportType, string> = {
  버스: "bg-main-blue",
  지하철: "bg-sub-pink",
  도보: "bg-sub-green",
  택시: "bg-sub-violet",
};

export function TransportDetail({ transport }: TransportDetailProps) {
  const { fromPlace, toPlace, durationText, costText, steps } = transport;
  return (
    <div className="relative flex min-w-0 flex-col gap-3 py-3">
      <div
        className="pointer-events-none absolute bottom-[28px] left-[14px] top-[28px] w-[1.5px]"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-[repeating-linear-gradient(to_bottom,var(--color-sub-gray)_0_4px,transparent_4px_9px)]" />
      </div>

      <div className="flex min-w-0 items-center gap-3 mb-2">
        <div className="relative z-10 flex size-7 shrink-0 items-center justify-center">
          <span className="size-3.5 rounded-full bg-sub-gray" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate text-lg font-semibold text-text-primary">
            {fromPlace ?? "출발 장소"}
          </span>
          <span className="shrink-0 text-md font-semibold text-sub-darkgray">
            {durationText ?? "-"} · {costText ?? "-"}
          </span>
        </div>
      </div>

      {steps.map((step) => (
        <div key={`${step.type}-${step.routeName}`} className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "relative z-10 flex size-7.5 shrink-0 items-center justify-center rounded-[12px]",
              TRANSPORT_COLORS[step.type],
            )}
          >
            <TransportIcon type={step.type} />
          </div>
          <TransportLegItem leg={step} />
        </div>
      ))}

      <div className="flex items-center gap-3 mt-2">
        <div className="relative z-10 flex size-7 shrink-0 items-center justify-center">
          <span className="size-3.5 rounded-full bg-sub-gray" />
        </div>
        <span className="truncate text-lg font-semibold text-text-primary">
          {toPlace ?? "도착 장소"}
        </span>
      </div>
    </div>
  );
}
