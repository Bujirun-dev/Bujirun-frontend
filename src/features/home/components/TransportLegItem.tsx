import { cn } from "@/shared/utils";
import type { TransportType } from "@/features/home/components/TransportIcons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { transitApi } from "@/shared/api/domains";

export interface TransportLegItemData {
  type: TransportType;
  routeName: string;
  from: string;
  to: string;
  arrivalText?: string;
  arsId?: string;
  routeNo?: string;
}

const BUS_ARRIVAL_POLL_MS = 30000;

// 버스 실시간 도착정보(GET /api/transit/arrival/bus)를 30초 간격으로 폴링해서 보여준다.
// arsId/routeNo가 없으면(지하철 등) 기존 정적 arrivalText로 대체된다.
function useLiveBusArrivalText(leg: TransportLegItemData) {
  const canPoll = leg.type === "버스" && !!leg.arsId && !!leg.routeNo;

  const { data, isError, refetch } = useQuery({
    queryKey: transitApi.keys.busArrival({ arsId: leg.arsId ?? "", routeNo: leg.routeNo ?? "" }),
    queryFn: () => transitApi.getBusArrival({ arsId: leg.arsId ?? "", routeNo: leg.routeNo ?? "" }),
    enabled: canPoll,
    refetchInterval: BUS_ARRIVAL_POLL_MS,
  });

  if (!canPoll || isError) return { text: leg.arrivalText, refetch };
  if (data === undefined) return { text: "도착정보 조회 중...", refetch };
  return { text: `${data}분 후 도착`, refetch };
}

interface TransportLegItemProps {
  leg: TransportLegItemData;
  metaText?: string;
  className?: string;
}

const ARRIVAL_VISIBLE_TYPES = ["버스", "지하철"] as const;

const ARRIVAL_COLORS: Record<(typeof ARRIVAL_VISIBLE_TYPES)[number], string> = {
  버스: "bg-main-blue",
  지하철: "bg-sub-pink",
};

export function TransportLegItem({ leg, metaText, className }: TransportLegItemProps) {
  const shouldShowArrival = ARRIVAL_VISIBLE_TYPES.includes(
    leg.type as (typeof ARRIVAL_VISIBLE_TYPES)[number],
  );

  const [isRotating, setIsRotating] = useState(false);
  const { text: arrivalText, refetch } = useLiveBusArrivalText(leg);

  const handleArrivalClick = () => {
    if (isRotating) return;
    setIsRotating(true);
    refetch();
  };

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate text-md font-semibold leading-none text-text-prima">
          {leg.routeName}
        </span>
        {metaText && (
          <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-sub-darkgray">
            {metaText}
          </span>
        )}
      </div>

      <div className="text-sm text-sub-darkgray leading-snug">
        <span className="break-words">{leg.from}</span>
        <svg
          viewBox="0 0 24 24"
          className="mx-1 inline size-3 shrink-0 fill-sub-darkgray align-middle"
          aria-hidden="true"
        >
          <path d="M18,12h0a2,2,0,0,0-.59-1.4l-4.29-4.3a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L15,11H5a1,1,0,0,0,0,2H15l-3.29,3.29a1,1,0,0,0,1.41,1.42l4.29-4.3A2,2,0,0,0,18,12Z" />
        </svg>
        <span className="break-words">{leg.to}</span>
      </div>

      {arrivalText && shouldShowArrival ? (
        <div
          onClick={handleArrivalClick}
          className={cn(
            "my-2 flex items-center justify-between rounded-[10px] px-3 py-2 text-sm font-semibold text-main-white cursor-pointer",
            ARRIVAL_COLORS[leg.type as (typeof ARRIVAL_VISIBLE_TYPES)[number]],
          )}
        >
          <span>{arrivalText}</span>
          <svg
            viewBox="0 0 512 512"
            onAnimationEnd={() => setIsRotating(false)}
            className={cn("size-3 fill-main-white", isRotating && "animate-spin")}
            aria-hidden="true"
          >
            <path d="M66.074,228.731C81.577,123.379,179.549,50.542,284.901,66.045c35.944,5.289,69.662,20.626,97.27,44.244l-24.853,24.853c-8.33,8.332-8.328,21.84,0.005,30.17c3.999,3.998,9.423,6.245,15.078,6.246h97.835c11.782,0,21.333-9.551,21.333-21.333V52.39c-0.003-11.782-9.556-21.331-21.338-21.329c-5.655,0.001-11.079,2.248-15.078,6.246L427.418,65.04C321.658-29.235,159.497-19.925,65.222,85.835c-33.399,37.467-55.073,83.909-62.337,133.573c-2.864,17.607,9.087,34.202,26.693,37.066c1.586,0.258,3.188,0.397,4.795,0.417C50.481,256.717,64.002,244.706,66.074,228.731z" />
            <path d="M479.429,256.891c-16.108,0.174-29.629,12.185-31.701,28.16C432.225,390.403,334.253,463.24,228.901,447.738c-35.944-5.289-69.662-20.626-97.27-44.244l24.853-24.853c8.33-8.332,8.328-21.84-0.005-30.17c-3.999-3.998-9.423-6.245-15.078-6.246H43.568c-11.782,0-21.333,9.551-21.333,21.333v97.835c0.003,11.782,9.556,21.331,21.338,21.329c5.655-0.001,11.079-2.248,15.078-6.246l27.733-27.733c105.735,94.285,267.884,85.004,362.17-20.732c33.417-37.475,55.101-83.933,62.363-133.615c2.876-17.605-9.064-34.208-26.668-37.084C482.655,257.051,481.044,256.91,479.429,256.891z" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
