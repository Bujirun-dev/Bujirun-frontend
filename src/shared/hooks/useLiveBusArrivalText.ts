"use client";

import { useQuery } from "@tanstack/react-query";
import { transitApi } from "@/shared/api/domains";

export interface LiveBusArrivalLeg {
  type: string;
  arrivalText?: string;
  arsId?: string;
  routeNo?: string;
}

const BUS_ARRIVAL_POLL_MS = 30000;

// 버스 실시간 도착정보(GET /api/transit/arrival/bus)를 30초 간격으로 폴링해서 보여준다.
// arsId/routeNo가 없으면(지하철 등) 기존 정적 arrivalText로 대체된다.
export function useLiveBusArrivalText(leg: LiveBusArrivalLeg) {
  const canPoll = leg.type === "버스" && !!leg.arsId && !!leg.routeNo;

  const { data, isError, refetch } = useQuery({
    queryKey: transitApi.keys.busArrival({ arsId: leg.arsId ?? "", routeNo: leg.routeNo ?? "" }),
    queryFn: () => transitApi.getBusArrival({ arsId: leg.arsId ?? "", routeNo: leg.routeNo ?? "" }),
    enabled: canPoll,
    refetchInterval: BUS_ARRIVAL_POLL_MS,
  });

  if (!canPoll || isError) return { text: leg.arrivalText, refetch };
  if (data === undefined) return { text: "도착정보 조회 중...", refetch };
  if (data === null) return { text: "도착정보 없음", refetch };
  return { text: `${data}분 후 도착`, refetch };
}
