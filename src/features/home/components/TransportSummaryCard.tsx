import { cn } from "@/shared/utils";
import { TransportIcon } from "@/features/home/components/TransportIcons";
import type { TransportOption } from "@/features/home/types/transport";

interface TransportSummaryCardProps extends Pick<
  TransportOption,
  "durationText" | "costText" | "steps"
> {
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
  const metaText = `${durationText} · ${costText}`;
  const visibleSteps = steps.slice(0, 2);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[14px] border border-main-blue bg-system-navbg px-3 py-2",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5">
        {visibleSteps.map((step, index) => (
          <TransportIcon
            key={`${step.type}-${index}`}
            type={step.type}
            className={cn(
              "size-3.5 fill-sub-darkgray",
              step.type === "버스" && "-translate-y-[1px]",
            )}
          />
        ))}
      </div>

      <span className="min-w-0 truncate text-sm font-medium text-sub-darkgray">{metaText}</span>
    </div>
  );
}
