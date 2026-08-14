import type { ReactNode } from "react";

import { SpeechBubble } from "@/components";

type CollectionProgressProps = {
  collectedCount: number;
  totalCount: number;
  icon?: ReactNode;
};

export function CollectionProgress({ collectedCount, totalCount, icon }: CollectionProgressProps) {
  const progress =
    totalCount > 0 ? Math.min(100, Math.round((collectedCount / totalCount) * 100)) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative h-3 flex-1 overflow-visible rounded-full bg-system-navbg">
          <div
            className="h-full rounded-full bg-main-blue transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />

          {icon && (
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${progress}%` }}
            >
              {icon}
            </div>
          )}
        </div>

        <p className="shrink-0 font-ssurround text-sm text-sub-gray">
          <span className="text-lg text-main-blue">{collectedCount}</span> / {totalCount}
        </p>
      </div>

      <SpeechBubble>
        <p className="font-paperlogy text-sm text-text-primary">
          영차영차, 현재 <span className="font-ssurround text-main-blue">{progress}%</span>{" "}
          수집했어요!
        </p>
      </SpeechBubble>
    </div>
  );
}

/*
사용할 때:

<CollectionProgress
  collectedCount={collectedCollectionCount}
  totalCount={totalCollectionCount}
  icon={
    <Image
      src={turtleIcon}
      alt=""
      className="h-auto w-10"
    />
  }
/>
*/
