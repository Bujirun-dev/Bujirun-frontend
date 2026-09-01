"use client";

import { useQuery } from "@tanstack/react-query";
import { transitApi } from "@/shared/api/domains";

export interface LiveArrivalLeg {
  type: string;
  arrivalText?: string;
  // 버스 실시간 도착정보(GET /api/transit/arrival/bus) 폴링용
  arsId?: string;
  routeNo?: string;
  // 지하철 도착정보(GET /api/transit/arrival/subway) 폴링용 — ODsay 배차 시각표 기준 추정치
  stationId?: number;
  wayCode?: number;
}

const ARRIVAL_POLL_MS = 30000;

// 버스/지하철 도착정보를 30초 간격으로 폴링해서 보여준다. 필요한 파라미터가 없으면
// (버스: arsId+routeNo, 지하철: stationId+wayCode) 기존 정적 arrivalText로 대체된다.
export function useLiveArrivalText(leg: LiveArrivalLeg) {
  const canPollBus = leg.type === "버스" && !!leg.arsId && !!leg.routeNo;
  const canPollSubway = leg.type === "지하철" && leg.stationId != null && leg.wayCode != null;
  const canPoll = canPollBus || canPollSubway;

  const { data, isError, refetch } = useQuery({
    queryKey: canPollSubway
      ? transitApi.keys.subwayArrival({ stationId: leg.stationId ?? 0, wayCode: leg.wayCode ?? 0 })
      : transitApi.keys.busArrival({ arsId: leg.arsId ?? "", routeNo: leg.routeNo ?? "" }),
    queryFn: () =>
      canPollSubway
        ? transitApi.getSubwayArrival({ stationId: leg.stationId ?? 0, wayCode: leg.wayCode ?? 0 })
        : transitApi.getBusArrival({ arsId: leg.arsId ?? "", routeNo: leg.routeNo ?? "" }),
    enabled: canPoll,
    refetchInterval: ARRIVAL_POLL_MS,
  });

  if (!canPoll || isError) return { text: leg.arrivalText, refetch };
  if (data === undefined) return { text: "도착정보 조회 중...", refetch };
  if (data === null) return { text: "도착정보 없음", refetch };
  return { text: `${data}분 후 도착`, refetch };
}
