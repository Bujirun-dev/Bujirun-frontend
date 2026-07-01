import type { Transport } from "@/features/home/data/sampleTransport";
import { cn } from "@/shared/utils";
import { TransportIcon } from "@/features/home/components/TransportIcons";

interface TransportSummaryCardProps extends Pick<Transport, "durationText" | "costText" | "steps"> {
  isRecommended?: boolean;
  className?: string;
}

export function TransportSummaryCard({
  durationText,
  costText,
  steps,
  isRecommended,
  className,
}: TransportSummaryCardProps) {
  const metaText = `${isRecommended ? "⭐ " : ""}${durationText} · ${costText}`;
  const visibleSteps = steps.slice(0, 2);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[14px] border border-main-blue bg-system-navbg px-4 py-2.5",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        {visibleSteps.map((step, index) => (
          <TransportIcon
            key={`${step.type}-${index}`}
            type={step.type}
            className="size-4 fill-sub-darkgray"
          />
        ))}
      </div>

      <span className="min-w-0 truncate text-md font-medium text-sub-darkgray">{metaText}</span>
    </div>
  );
}
